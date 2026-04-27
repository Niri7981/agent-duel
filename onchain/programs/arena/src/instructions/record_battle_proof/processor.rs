use pinocchio::{
    cpi::{Seed, Signer},
    error::ProgramError,
    AccountView, Address, ProgramResult,
};

use super::{accounts::RecordBattleProofAccounts, data::RecordBattleProofData};
use crate::{
    errors::ArenaError,
    state::{BattleProofAnchor, BATTLE_PROOF_SEED},
};

pub struct RecordBattleProof<'a> {
    pub program_id: &'a Address,
    pub accounts: RecordBattleProofAccounts<'a>,
    pub data: RecordBattleProofData,
}

impl<'a> TryFrom<(&'a Address, &'a [u8], &'a [AccountView])> for RecordBattleProof<'a> {
    type Error = ProgramError;

    fn try_from(
        (program_id, data, accounts): (&'a Address, &'a [u8], &'a [AccountView]),
    ) -> Result<Self, Self::Error> {
        Ok(Self {
            program_id,
            accounts: RecordBattleProofAccounts::try_from(accounts)?,
            data: RecordBattleProofData::try_from(data)?,
        })
    }
}

impl RecordBattleProof<'_> {
    // 这里在干嘛：
    // 创建 battle proof PDA，并把后端已经固化的 proof 摘要写到链上。
    // 为什么这么写：
    // settlement 和 reputation 计算继续留在 app backend；链上只保存可复算、可验证的公共锚点。
    // 最后返回什么：
    // 成功时返回 Ok，proof PDA 中保存 round、hash、winner identity、side、settled_at、version 和 authority。
    pub fn process(&self) -> ProgramResult {
        let (expected_proof_address, bump) =
            BattleProofAnchor::derive_address(&self.data.round_id_seed, self.program_id);

        if self.accounts.proof_anchor.address() != &expected_proof_address {
            return Err(ArenaError::InvalidProofAccount.into());
        }

        let bump_seed = [bump];
        let seeds = [
            Seed::from(BATTLE_PROOF_SEED),
            Seed::from(&self.data.round_id_seed),
            Seed::from(&bump_seed),
        ];
        let signers = [Signer::from(&seeds)];

        pinocchio_system::create_account_with_minimum_balance_signed(
            self.accounts.proof_anchor,
            BattleProofAnchor::LEN,
            self.program_id,
            self.accounts.authority,
            None,
            &signers,
        )?;

        let anchor = BattleProofAnchor {
            authority: *self.accounts.authority.address().as_array(),
            proof_hash: self.data.proof_hash,
            round_id_seed: self.data.round_id_seed,
            round_id: self.data.round_id,
            winner_identity_key: self.data.winner_identity_key,
            settled_at: self.data.settled_at,
            proof_version: self.data.proof_version,
            winning_side: self.data.winning_side,
            round_id_len: self.data.round_id_len,
            winner_identity_key_len: self.data.winner_identity_key_len,
            bump,
        };

        let mut account_data = self.accounts.proof_anchor.try_borrow_mut()?;
        anchor.write_to(&mut account_data)
    }
}
