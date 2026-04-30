import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

import { mapRoundToBattleRecord } from "./get-battle-history";
import type { BattleRecord } from "./types";

const battleRoundInclude = {
  actions: {
    include: {
      traceSteps: {
        orderBy: [{ stepIndex: "asc" as const }, { id: "asc" as const }],
      },
    },
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
  },
  agents: {
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
  },
  event: true,
  settlement: true,
} satisfies Prisma.RoundInclude;

// 这里在干嘛：
// 读取一场指定 round 的独立 battle record。
// 为什么这么写：
// battle record 既要支持列表，也要支持“看单场 battle”的接口和后续页面。
// 这个函数让单场读取不必复用列表服务再手动筛选。
// 最后返回什么：
// 找到时返回一条 BattleRecord；找不到时返回 null。
export async function getBattleRecord(
  roundId: string,
): Promise<BattleRecord | null> {
  const round = await prisma.round.findUnique({
    include: battleRoundInclude,
    where: {
      id: roundId,
    },
  });

  return round ? mapRoundToBattleRecord(round) : null;
}
