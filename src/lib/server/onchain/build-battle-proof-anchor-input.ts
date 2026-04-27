import type { PublicKey } from "@solana/web3.js";

import type {
  RecordBattleProofInput,
  RecordBattleProofWinningSide,
} from "../../../../onchain/clients/arena";
import type { BattleProofPayload } from "@/lib/server/battles/types";

type BattleProofAnchorRecord = {
  proofHash: string;
  proofHashEncoding: string;
  proofVersion: number;
  roundId: string;
};

export const EXPECTED_BATTLE_PROOF_HASH_ENCODING = "canonical-json-v1";

function normalizeWinningSide(
  winningSide: BattleProofPayload["winningSide"],
): RecordBattleProofWinningSide {
  if (winningSide === "yes" || winningSide === "no") {
    return winningSide;
  }

  return "none";
}

function parseSettledAt(payload: BattleProofPayload) {
  if (!payload.settledAt) {
    throw new Error(`Battle proof ${payload.roundId} is missing settledAt.`);
  }

  const settledAt = new Date(payload.settledAt);

  if (Number.isNaN(settledAt.getTime())) {
    throw new Error(`Battle proof ${payload.roundId} has invalid settledAt.`);
  }

  return settledAt;
}

function assertRecordMatchesPayload(
  payload: BattleProofPayload,
  record: BattleProofAnchorRecord,
) {
  if (record.roundId !== payload.roundId) {
    throw new Error(
      `Battle proof record roundId ${record.roundId} does not match payload roundId ${payload.roundId}.`,
    );
  }

  if (record.proofVersion !== payload.proofVersion) {
    throw new Error(
      `Battle proof record version ${record.proofVersion} does not match payload version ${payload.proofVersion}.`,
    );
  }

  if (record.proofHashEncoding !== EXPECTED_BATTLE_PROOF_HASH_ENCODING) {
    throw new Error(
      `Unsupported battle proof hash encoding ${record.proofHashEncoding}.`,
    );
  }

  if (!/^[0-9a-f]{64}$/.test(record.proofHash)) {
    throw new Error("Battle proof hash must be lowercase SHA-256 hex.");
  }
}

// 这里在干嘛：
// 把数据库里的 BattleProofRecord 和完整 BattleProofPayload 映射成链上 instruction input。
// 为什么这么写：
// settlement 已经在后端完成；这里不重新结算，只把稳定 proof 字段整理成 record_battle_proof 需要的形状。
// 最后返回什么：
// 返回可直接传给 buildRecordBattleProofInstruction 的输入对象。
export function buildBattleProofAnchorInput(params: {
  authority: PublicKey;
  payload: BattleProofPayload;
  record: BattleProofAnchorRecord;
}): RecordBattleProofInput {
  assertRecordMatchesPayload(params.payload, params.record);

  const winningSide = normalizeWinningSide(params.payload.winningSide);
  const winnerIdentityKey = params.payload.winnerIdentityKey;

  if (winningSide !== "none" && !winnerIdentityKey) {
    throw new Error(
      `Battle proof ${params.payload.roundId} has a winning side but no winner identity.`,
    );
  }

  return {
    authority: params.authority,
    proofHash: params.record.proofHash,
    proofVersion: params.payload.proofVersion,
    roundId: params.payload.roundId,
    settledAt: parseSettledAt(params.payload),
    winnerIdentityKey,
    winningSide,
  };
}
