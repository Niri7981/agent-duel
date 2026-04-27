import { createHash } from "node:crypto";

import { PublicKey } from "@solana/web3.js";

import {
  ARENA_PROGRAM_ID,
  BATTLE_PROOF_SEED_PREFIX,
  ROUND_ID_SEED_LENGTH,
} from "./constants";
import type { BattleProofPda } from "./types";

export function buildRoundIdSeed(roundId: string): Uint8Array {
  const seed = createHash("sha256").update(roundId, "utf8").digest();

  if (seed.length !== ROUND_ID_SEED_LENGTH) {
    throw new Error("Round id seed must be 32 bytes.");
  }

  return new Uint8Array(seed);
}

// 这里在干嘛：
// 用 app 的 roundId 派生 battle proof PDA。
// 为什么这么写：
// roundId 是后端业务 id，长度不稳定；合约 PDA seed 固定使用 sha256(roundId) 的 32 bytes。
// 最后返回什么：
// 返回 proof PDA、bump 和 instruction data 里也要带上的 roundIdSeed。
export function deriveBattleProofPda(
  roundId: string,
  programId: PublicKey = ARENA_PROGRAM_ID,
): BattleProofPda {
  const roundIdSeed = buildRoundIdSeed(roundId);
  const [proofAddress, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(BATTLE_PROOF_SEED_PREFIX, "utf8"), Buffer.from(roundIdSeed)],
    programId,
  );

  return {
    bump,
    proofAddress,
    roundIdSeed,
  };
}
