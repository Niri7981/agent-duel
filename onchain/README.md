# Onchain Workspace

This folder contains the dedicated Solana / Anchor workspace for AgentDuel.

It is intentionally separated from the main Next.js app so the repo reads in
clear product layers:

- `src/` for frontend, backend orchestration, runtime, and storage
- `onchain/` for durable chain record and settlement logic

Current contents:

- `Anchor.toml` for the local Anchor workspace config
- `programs/arena/` for the Solana program
- `tests/` for Anchor tests
- `migrations/` for deployment scripts

The onchain layer is still early, but this folder should remain the single home
for contract code and chain-facing tests.
