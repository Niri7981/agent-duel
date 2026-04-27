import { createHash } from "node:crypto";

import type { BattleProofPayload } from "./types";

type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue };

export const BATTLE_PROOF_HASH_ALGORITHM = "sha256";
export const BATTLE_PROOF_HASH_ENCODING = "canonical-json-v1";

function assertCanonicalJsonValue(value: unknown): asserts value is CanonicalJsonValue {
  if (value === null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      assertCanonicalJsonValue(item);
    }

    return;
  }

  switch (typeof value) {
    case "boolean":
    case "string":
      return;
    case "number":
      if (Number.isFinite(value)) {
        return;
      }

      throw new Error("Battle proof payload cannot contain non-finite numbers.");
    case "object":
      for (const [key, entryValue] of Object.entries(value)) {
        if (entryValue === undefined) {
          throw new Error(
            `Battle proof payload cannot contain undefined at key ${key}.`,
          );
        }

        assertCanonicalJsonValue(entryValue);
      }

      return;
    default:
      throw new Error(
        `Battle proof payload cannot contain ${typeof value} values.`,
      );
  }
}

// 这里在干嘛：
// 把 BattleProofPayload 转成稳定的 canonical JSON 字符串。
// 为什么这么写：
// 链上只存 proof hash，所以同一份 proof 在任何机器上都必须编码成完全相同的 bytes。
// object key 在这里排序；array 顺序保留，因为参赛者和 reputation effect 的顺序本身属于 proof 内容。
// 最后返回什么：
// 返回用于 SHA-256 的 UTF-8 JSON 字符串。
export function canonicalizeBattleProofPayload(
  payload: BattleProofPayload,
): string {
  assertCanonicalJsonValue(payload);

  return canonicalJson(payload);
}

// 这里在干嘛：
// 为 BattleProofPayload v1 计算链上要记录的 proof hash。
// 为什么这么写：
// app database 保存完整 payload，Solana 保存 32-byte hash commitment；
// 这个函数就是两层之间唯一需要共享的 v1 hash 规范。
// 最后返回什么：
// 返回 lowercase hex SHA-256 hash，写链上时再转成 32 raw bytes。
export function buildBattleProofHash(payload: BattleProofPayload): string {
  const canonicalPayload = canonicalizeBattleProofPayload(payload);

  return createHash(BATTLE_PROOF_HASH_ALGORITHM)
    .update(canonicalPayload, "utf8")
    .digest("hex");
}

function canonicalJson(value: CanonicalJsonValue): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }

  return `{${Object.entries(value)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, entryValue]) => {
      return `${JSON.stringify(key)}:${canonicalJson(entryValue)}`;
    })
    .join(",")}}`;
}
