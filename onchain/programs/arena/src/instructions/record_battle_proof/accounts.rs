use pinocchio::{error::ProgramError, AccountView};

use crate::errors::ArenaError;

pub struct RecordBattleProofAccounts<'a> {
    pub authority: &'a AccountView,
    pub proof_anchor: &'a AccountView,
}

impl<'a> TryFrom<&'a [AccountView]> for RecordBattleProofAccounts<'a> {
    type Error = ProgramError;

    fn try_from(accounts: &'a [AccountView]) -> Result<Self, Self::Error> {
        let [authority, proof_anchor, _remaining @ ..] = accounts else {
            return Err(ProgramError::NotEnoughAccountKeys);
        };

        if !authority.is_signer() {
            return Err(ProgramError::MissingRequiredSignature);
        }

        if !authority.is_writable() || !proof_anchor.is_writable() {
            return Err(ProgramError::InvalidAccountData);
        }

        if proof_anchor.data_len() != 0 {
            return Err(ArenaError::ProofAlreadyRecorded.into());
        }

        Ok(Self {
            authority,
            proof_anchor,
        })
    }
}
