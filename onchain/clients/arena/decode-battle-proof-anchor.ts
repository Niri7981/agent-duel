import { PublicKey } from "@solana/web3.js";

import {
  AUTHORITY_LENGTH,
  BATTLE_PROOF_ANCHOR_ACCOUNT_LENGTH,
  BATTLE_PROOF_ANCHOR_DISCRIMINATOR,
  BATTLE_PROOF_ANCHOR_VERSION,
  IDENTITY_KEY_MAX_LENGTH,
  PROOF_HASH_LENGTH,
  ROUND_ID_MAX_LENGTH,
  ROUND_ID_SEED_LENGTH,
} from "./constants";
import type {
  DecodedBattleProofAnchor,
  RecordBattleProofWinningSide,
} from "./types";

function readBytes(data: Buffer, offset: number, length: number) {
  return data.subarray(offset, offset + length);
}

function decodeUtf8Prefix(
  bytes: Buffer,
  length: number,
  fieldName: string,
): string {
  if (length > bytes.length) {
    throw new Error(`${fieldName} length exceeds account field length.`);
  }

  const trailingBytes = bytes.subarray(length);

  if (trailingBytes.some((byte) => byte !== 0)) {
    throw new Error(`${fieldName} has non-zero bytes after its length.`);
  }

  return bytes.subarray(0, length).toString("utf8");
}

function decodeWinningSide(value: number): RecordBattleProofWinningSide {
  switch (value) {
    case 0:
      return "none";
    case 1:
      return "yes";
    case 2:
      return "no";
    default:
      throw new Error("Battle proof anchor has invalid winning side.");
  }
}

// 这里在干嘛：
// 把 Pinocchio 写入的固定长度 BattleProofAnchor 账户数据解码成 TS 对象。
// 为什么这么写：
// demo 的 proof 面板不能只相信数据库里的 signature；
// 后端需要能反查 PDA 数据，并逐字段验证它和 BattleProofRecord 是否一致。
// 最后返回什么：
// 返回解码后的 compact proof anchor 字段。
export function decodeBattleProofAnchor(
  accountData: Buffer | Uint8Array,
): DecodedBattleProofAnchor {
  const data = Buffer.from(accountData);

  if (data.length !== BATTLE_PROOF_ANCHOR_ACCOUNT_LENGTH) {
    throw new Error("Battle proof anchor account has invalid length.");
  }

  let offset = 0;
  const discriminator = data.readUInt8(offset);
  offset += 1;
  const version = data.readUInt8(offset);
  offset += 1;

  if (discriminator !== BATTLE_PROOF_ANCHOR_DISCRIMINATOR) {
    throw new Error("Battle proof anchor discriminator mismatch.");
  }

  if (version !== BATTLE_PROOF_ANCHOR_VERSION) {
    throw new Error("Battle proof anchor version mismatch.");
  }

  const authority = new PublicKey(readBytes(data, offset, AUTHORITY_LENGTH));
  offset += AUTHORITY_LENGTH;

  const proofHash = readBytes(data, offset, PROOF_HASH_LENGTH).toString("hex");
  offset += PROOF_HASH_LENGTH;

  const roundIdSeed = new Uint8Array(
    readBytes(data, offset, ROUND_ID_SEED_LENGTH),
  );
  offset += ROUND_ID_SEED_LENGTH;

  const roundIdBytes = readBytes(data, offset, ROUND_ID_MAX_LENGTH);
  offset += ROUND_ID_MAX_LENGTH;

  const winnerIdentityKeyBytes = readBytes(
    data,
    offset,
    IDENTITY_KEY_MAX_LENGTH,
  );
  offset += IDENTITY_KEY_MAX_LENGTH;

  const settledAtUnix = Number(data.readBigInt64LE(offset));
  offset += 8;

  const proofVersion = data.readUInt16LE(offset);
  offset += 2;

  const winningSide = decodeWinningSide(data.readUInt8(offset));
  offset += 1;

  const roundIdLength = data.readUInt8(offset);
  offset += 1;

  const winnerIdentityKeyLength = data.readUInt8(offset);
  offset += 1;

  const bump = data.readUInt8(offset);

  return {
    authority,
    bump,
    proofHash,
    proofVersion,
    roundId: decodeUtf8Prefix(roundIdBytes, roundIdLength, "roundId"),
    roundIdLength,
    roundIdSeed,
    settledAtUnix,
    winnerIdentityKey:
      winnerIdentityKeyLength === 0
        ? null
        : decodeUtf8Prefix(
            winnerIdentityKeyBytes,
            winnerIdentityKeyLength,
            "winnerIdentityKey",
          ),
    winnerIdentityKeyLength,
    winningSide,
  };
}
