use anchor_lang::prelude::*;

declare_id!("Arena111111111111111111111111111111111111111");

#[program]
pub mod arena {
    use super::*;

    pub fn initialize_round(_ctx: Context<InitializeRound>) -> Result<()> {
        Ok(())
    }

    pub fn settle_round(_ctx: Context<SettleRound>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRound {}

#[derive(Accounts)]
pub struct SettleRound {}
