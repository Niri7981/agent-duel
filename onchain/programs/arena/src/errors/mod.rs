use pinocchio::error::ProgramError;

#[repr(u32)]
pub enum ArenaError {
    InvalidRoundId = 6_000,
    InvalidWinnerIdentityKey = 6_001,
    InvalidWinningSide = 6_002,
    InvalidProofVersion = 6_003,
    InvalidProofAccount = 6_004,
    ProofAlreadyRecorded = 6_005,
    InvalidSettlementTimestamp = 6_006,
}

impl From<ArenaError> for ProgramError {
    fn from(error: ArenaError) -> Self {
        ProgramError::Custom(error as u32)
    }
}
