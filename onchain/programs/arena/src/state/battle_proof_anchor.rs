use pinocchio::{error::ProgramError, Address};

use crate::utils::bytes::{write_bytes, write_i64, write_u16, write_u8};

pub const ROUND_ID_SEED_LEN: usize = 32;
pub const ROUND_ID_MAX_LEN: usize = 64;
pub const PROOF_HASH_LEN: usize = 32;
pub const IDENTITY_KEY_MAX_LEN: usize = 64;

pub const BATTLE_PROOF_SEED: &[u8] = b"battle_proof";

pub struct WinningSide;

impl WinningSide {
    pub const NONE: u8 = 0;
    pub const YES: u8 = 1;
    pub const NO: u8 = 2;

    #[inline(always)]
    pub fn is_valid(value: u8) -> bool {
        matches!(value, Self::NONE | Self::YES | Self::NO)
    }
}

pub struct BattleProofAnchor {
    pub authority: [u8; 32],
    pub proof_hash: [u8; PROOF_HASH_LEN],
    pub round_id_seed: [u8; ROUND_ID_SEED_LEN],
    pub round_id: [u8; ROUND_ID_MAX_LEN],
    pub winner_identity_key: [u8; IDENTITY_KEY_MAX_LEN],
    pub settled_at: i64,
    pub proof_version: u16,
    pub winning_side: u8,
    pub round_id_len: u8,
    pub winner_identity_key_len: u8,
    pub bump: u8,
}

impl BattleProofAnchor {
    pub const DISCRIMINATOR: u8 = 1;
    pub const VERSION: u8 = 1;
    pub const DATA_LEN: usize = 240;
    pub const LEN: usize = 2 + Self::DATA_LEN;

    #[inline(always)]
    pub fn derive_address(
        round_id_seed: &[u8; ROUND_ID_SEED_LEN],
        program_id: &Address,
    ) -> (Address, u8) {
        Address::find_program_address(&[BATTLE_PROOF_SEED, round_id_seed], program_id)
    }

    // 这里在干嘛：
    // 把一条 compact battle proof anchor 写进固定长度的链上账户。
    // 为什么这么写：
    // 链上只需要保存可验证摘要和公开身份字段，完整 proof JSON 继续留在 app database。
    // 最后返回什么：
    // 成功时账户数据包含 discriminator、version 和 proof anchor 字段。
    pub fn write_to(&self, data: &mut [u8]) -> Result<(), ProgramError> {
        if data.len() < Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }

        data[..Self::LEN].fill(0);

        let mut offset = 0;
        write_u8(data, &mut offset, Self::DISCRIMINATOR)?;
        write_u8(data, &mut offset, Self::VERSION)?;
        write_bytes(data, &mut offset, &self.authority)?;
        write_bytes(data, &mut offset, &self.proof_hash)?;
        write_bytes(data, &mut offset, &self.round_id_seed)?;
        write_bytes(data, &mut offset, &self.round_id)?;
        write_bytes(data, &mut offset, &self.winner_identity_key)?;
        write_i64(data, &mut offset, self.settled_at)?;
        write_u16(data, &mut offset, self.proof_version)?;
        write_u8(data, &mut offset, self.winning_side)?;
        write_u8(data, &mut offset, self.round_id_len)?;
        write_u8(data, &mut offset, self.winner_identity_key_len)?;
        write_u8(data, &mut offset, self.bump)?;
        write_bytes(data, &mut offset, &[0u8; 2])?;

        Ok(())
    }
}
