import { prisma } from "@/lib/db/prisma";

import type { BattleProofPayload } from "./types";

// 这里在干嘛：
// 读取某场 battle 已经固化好的 proof payload。
// 为什么这么写：
// proof payload 不应该每次都从 UI 逻辑临时反推，
// 而应该优先读取 settle 时落下来的稳定快照。
// 最后返回什么：
// 找到时返回 BattleProofPayload；找不到时返回 null。
export async function getBattleProof(
  roundId: string,
): Promise<BattleProofPayload | null> {
  const record = await prisma.battleProofRecord.findUnique({
    where: {
      roundId,
    },
  });

  return record ? (JSON.parse(record.payload) as BattleProofPayload) : null;
}
