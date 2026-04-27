import {
  IDENTITY_KEY_MAX_LENGTH,
  PROOF_HASH_LENGTH,
  RECORD_BATTLE_PROOF_DATA_LENGTH,
  RECORD_BATTLE_PROOF_DISCRIMINATOR,
  ROUND_ID_MAX_LENGTH,
  ROUND_ID_SEED_LENGTH,
} from "./constants";
import type { RecordBattleProofInput, RecordBattleProofWinningSide } from "./types";

type EncodeRecordBattleProofInput = RecordBattleProofInput & {
  roundIdSeed: Uint8Array;
};

function encodeWinningSide(side: RecordBattleProofWinningSide) {
  switch (side) {
    case "none":
      return 0;
    case "yes":
      return 1;
    case "no":
      return 2;
  }
}

function encodeFixedUtf8(value: string, maxLength: number, fieldName: string) {
  const bytes = Buffer.from(value, "utf8");

  if (bytes.length > maxLength) {
    throw new Error(`${fieldName} must fit in ${maxLength} UTF-8 bytes.`);
  }

  return {
    bytes,
    length: bytes.length,
  };
}

function encodeProofHash(proofHash: string) {
  const normalizedHash = proofHash.startsWith("0x")
    ? proofHash.slice(2)
    : proofHash;

  if (!/^[0-9a-fA-F]{64}$/.test(normalizedHash)) {
    throw new Error("proofHash must be a 32-byte SHA-256 hex string.");
  }

  const bytes = Buffer.from(normalizedHash, "hex");

  if (bytes.length !== PROOF_HASH_LENGTH) {
    throw new Error("proofHash must decode to 32 bytes.");
  }

  return bytes;
}

function encodeSettledAt(settledAt: Date | number) {
  if (settledAt instanceof Date) {
    return Math.floor(settledAt.getTime() / 1000);
  }

  return Math.floor(settledAt);
}

// 这里在干嘛：
// 把 record_battle_proof 的输入编码成合约指令 data。
// 为什么这么写：
// Pinocchio 合约端按固定字节布局读取，TS builder 必须和 Rust 的字段顺序、长度完全一致。
// 最后返回什么：
// 返回包含 1-byte discriminator 的 instruction data。
export function encodeRecordBattleProofInstructionData(
  input: EncodeRecordBattleProofInput,
): Buffer {
  if (input.roundIdSeed.length !== ROUND_ID_SEED_LENGTH) {
    throw new Error("roundIdSeed must be 32 bytes.");
  }

  if (!Number.isInteger(input.proofVersion) || input.proofVersion <= 0) {
    throw new Error("proofVersion must be a positive integer.");
  }

  if (input.proofVersion > 0xffff) {
    throw new Error("proofVersion must fit in u16.");
  }

  const roundId = encodeFixedUtf8(
    input.roundId,
    ROUND_ID_MAX_LENGTH,
    "roundId",
  );
  const winnerIdentityKey = encodeFixedUtf8(
    input.winnerIdentityKey ?? "",
    IDENTITY_KEY_MAX_LENGTH,
    "winnerIdentityKey",
  );
  const winningSide = encodeWinningSide(input.winningSide);

  if (winningSide !== 0 && winnerIdentityKey.length === 0) {
    throw new Error("winnerIdentityKey is required when winningSide is yes/no.");
  }

  const settledAt = encodeSettledAt(input.settledAt);

  if (!Number.isInteger(settledAt) || settledAt <= 0) {
    throw new Error("settledAt must be a positive Unix timestamp.");
  }

  const proofHash = encodeProofHash(input.proofHash);
  const data = Buffer.alloc(RECORD_BATTLE_PROOF_DATA_LENGTH);
  let offset = 0;

  data.writeUInt8(RECORD_BATTLE_PROOF_DISCRIMINATOR, offset);
  offset += 1;

  Buffer.from(input.roundIdSeed).copy(data, offset);
  offset += ROUND_ID_SEED_LENGTH;

  data.writeUInt8(roundId.length, offset);
  offset += 1;

  roundId.bytes.copy(data, offset);
  offset += ROUND_ID_MAX_LENGTH;

  proofHash.copy(data, offset);
  offset += PROOF_HASH_LENGTH;

  data.writeUInt8(winnerIdentityKey.length, offset);
  offset += 1;

  winnerIdentityKey.bytes.copy(data, offset);
  offset += IDENTITY_KEY_MAX_LENGTH;

  data.writeUInt8(winningSide, offset);
  offset += 1;

  data.writeBigInt64LE(BigInt(settledAt), offset);
  offset += 8;

  data.writeUInt16LE(input.proofVersion, offset);
  offset += 2;

  if (offset !== RECORD_BATTLE_PROOF_DATA_LENGTH) {
    throw new Error("record_battle_proof instruction encoding length mismatch.");
  }

  return data;
}
