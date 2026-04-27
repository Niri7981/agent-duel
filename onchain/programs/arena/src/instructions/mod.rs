pub mod record_battle_proof;

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use record_battle_proof::RecordBattleProof;

pub enum ArenaInstruction {
    RecordBattleProof,
}

impl TryFrom<u8> for ArenaInstruction {
    type Error = ProgramError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::RecordBattleProof),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}

#[inline(always)]
pub fn process_instruction(
    program_id: &Address,
    accounts: &[AccountView],
    instruction_data: &[u8],
) -> ProgramResult {
    let (discriminator, data) = instruction_data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match ArenaInstruction::try_from(*discriminator)? {
        ArenaInstruction::RecordBattleProof => {
            RecordBattleProof::try_from((program_id, data, accounts))?.process()
        }
    }
}
