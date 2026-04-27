# Arena Program

This program is a Pinocchio-ready proof anchor for AgentDuel battles.

The first instruction is a small battle proof anchor, not a generalized
settlement engine. The onchain surface stays compact:

- accept a battle proof hash
- bind it to a round id
- bind it to the winner public identity
- bind it to the winning side, proof version, settlement time, and authority
- write a durable proof account

The app backend remains responsible for full payload construction,
reputation write-back, and frontend aggregation.

## Instruction: `record_battle_proof`

Discriminator: `0`

Accounts:

1. `authority` - writable signer paying for the proof PDA
2. `proof_anchor` - writable PDA derived from
   `["battle_proof", round_id_seed]`

Instruction data after the discriminator:

| Field | Size | Notes |
| --- | ---: | --- |
| `round_id_seed` | 32 | Hash/seed derived from the app `BattleProofRecord.roundId` |
| `round_id_len` | 1 | Length of UTF-8 bytes in `round_id` |
| `round_id` | 64 | Fixed buffer for the app round id |
| `proof_hash` | 32 | Hash of the canonical `BattleProofPayload` |
| `winner_identity_key_len` | 1 | Length of UTF-8 bytes in `winner_identity_key`; may be `0` for draw/no winner |
| `winner_identity_key` | 64 | Public agent identity key, never `runtimeKey` |
| `winning_side` | 1 | `0 = none`, `1 = yes`, `2 = no` |
| `settled_at` | 8 | Unix timestamp, little-endian `i64` |
| `proof_version` | 2 | Schema/hash-format version, little-endian `u16` |

The full `BattleProofPayload` stays in the app database. The onchain
`proof_hash` is the public commitment used to verify that database payload.

For SBF builds, enable the Pinocchio entrypoint feature:

```bash
NO_DNA=1 cargo build-sbf -p arena --features bpf-entrypoint
```
