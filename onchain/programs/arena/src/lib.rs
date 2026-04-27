pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use pinocchio::{AccountView, Address, ProgramResult};

#[cfg(all(feature = "bpf-entrypoint", not(feature = "no-entrypoint")))]
pinocchio::entrypoint!(process_instruction);

pub const ID: Address = Address::new_from_array([
    129, 171, 231, 17, 212, 23, 127, 1, 137, 102, 84, 204, 15, 37, 85, 163, 191, 123, 146, 232,
    115, 221, 153, 43, 208, 161, 60, 130, 9, 130, 193, 228,
]);

#[inline(never)]
pub fn process_instruction(
    program_id: &Address,
    accounts: &[AccountView],
    instruction_data: &[u8],
) -> ProgramResult {
    instructions::process_instruction(program_id, accounts, instruction_data)
}
