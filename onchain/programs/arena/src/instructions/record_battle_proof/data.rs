use pinocchio::error::ProgramError;

use crate::{
    errors::ArenaError,
    state::{
        WinningSide, IDENTITY_KEY_MAX_LEN, PROOF_HASH_LEN, ROUND_ID_MAX_LEN, ROUND_ID_SEED_LEN,
    },
    utils::bytes::{is_all_zero, read_array, read_i64, read_u16, read_u8, validate_utf8_prefix},
};

pub struct RecordBattleProofData {
    pub round_id_seed: [u8; ROUND_ID_SEED_LEN],
    pub round_id_len: u8,
    pub round_id: [u8; ROUND_ID_MAX_LEN],
    pub proof_hash: [u8; PROOF_HASH_LEN],
    pub winner_identity_key_len: u8,
    pub winner_identity_key: [u8; IDENTITY_KEY_MAX_LEN],
    pub winning_side: u8,
    pub settled_at: i64,
    pub proof_version: u16,
}

impl RecordBattleProofData {
    pub const LEN: usize = ROUND_ID_SEED_LEN
        + 1
        + ROUND_ID_MAX_LEN
        + PROOF_HASH_LEN
        + 1
        + IDENTITY_KEY_MAX_LEN
        + 1
        + 8
        + 2;
}

impl TryFrom<&[u8]> for RecordBattleProofData {
    type Error = ProgramError;

    fn try_from(data: &[u8]) -> Result<Self, Self::Error> {
        if data.len() != Self::LEN {
            return Err(ProgramError::InvalidInstructionData);
        }

        let mut offset = 0;
        let round_id_seed = read_array::<ROUND_ID_SEED_LEN>(data, &mut offset)?;
        let round_id_len = read_u8(data, &mut offset)?;
        let round_id = read_array::<ROUND_ID_MAX_LEN>(data, &mut offset)?;
        let proof_hash = read_array::<PROOF_HASH_LEN>(data, &mut offset)?;
        let winner_identity_key_len = read_u8(data, &mut offset)?;
        let winner_identity_key = read_array::<IDENTITY_KEY_MAX_LEN>(data, &mut offset)?;
        let winning_side = read_u8(data, &mut offset)?;
        let settled_at = read_i64(data, &mut offset)?;
        let proof_version = read_u16(data, &mut offset)?;

        if round_id_len == 0 || is_all_zero(&round_id_seed) {
            return Err(ArenaError::InvalidRoundId.into());
        }

        if is_all_zero(&proof_hash) {
            return Err(ProgramError::InvalidInstructionData);
        }

        if !WinningSide::is_valid(winning_side) {
            return Err(ArenaError::InvalidWinningSide.into());
        }

        if winning_side != WinningSide::NONE && winner_identity_key_len == 0 {
            return Err(ArenaError::InvalidWinnerIdentityKey.into());
        }

        if settled_at <= 0 {
            return Err(ArenaError::InvalidSettlementTimestamp.into());
        }

        if proof_version == 0 {
            return Err(ArenaError::InvalidProofVersion.into());
        }

        validate_utf8_prefix(&round_id, round_id_len).map_err(|_| ArenaError::InvalidRoundId)?;
        validate_utf8_prefix(&winner_identity_key, winner_identity_key_len)
            .map_err(|_| ArenaError::InvalidWinnerIdentityKey)?;

        Ok(Self {
            round_id_seed,
            round_id_len,
            round_id,
            proof_hash,
            winner_identity_key_len,
            winner_identity_key,
            winning_side,
            settled_at,
            proof_version,
        })
    }
}
