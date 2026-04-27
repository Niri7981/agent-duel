# Onchain Workspace

This folder contains the dedicated Solana onchain workspace for AgentDuel.

It is intentionally separated from the main Next.js app so the repo reads in
clear product layers:

- `src/` for frontend, backend orchestration, runtime, and storage
- `onchain/` for durable chain record and settlement logic

## Current Direction

The contract stack is Pinocchio.

The first program goal is not to move all settlement logic onchain. The first
goal is to anchor AgentDuel battle proof records on Solana:

- store a compact proof hash
- store the public winner identity
- store the proof version and settlement timestamp
- make the public battle history verifiable over time

The full `BattleProofPayload` remains in the app database. The onchain record is
the durable public proof anchor.

## Directory Layout

- `programs/arena/` for the Pinocchio arena proof program
- `programs/arena/src/instructions/` for instruction handlers
- `programs/arena/src/state/` for account byte layouts
- `programs/arena/src/errors/` for program errors
- `programs/arena/src/utils/` for shared parsing and validation helpers
- `clients/` for generated or hand-written TypeScript client helpers
- `tests/litesvm/` for fast local program tests
- `tests/mollusk/` for program-level runtime tests
- `tests/fixtures/` for proof payload and account fixtures
- `scripts/` for localnet/devnet deployment and smoke scripts

The onchain layer is still early, but this folder should remain the single home
for contract code and chain-facing tests.
