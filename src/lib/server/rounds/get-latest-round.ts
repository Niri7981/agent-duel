import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

// 这是服务层里“完整 round 记录”的查询形状。
// 后面 mapper 和 API 都围绕这份结构走，避免每个地方各查各的。
export type PersistedRoundRecord = Prisma.RoundGetPayload<{
  include: {
    actions: {
      include: {
        roundAgent: true;
      };
    };
    agents: true;
    event: true;
    settlement: true;
  };
}>;

export async function getLatestRound(): Promise<PersistedRoundRecord | null> {
  return prisma.round.findFirst({
    include: {
      actions: {
        include: {
          roundAgent: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      agents: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      event: true,
      settlement: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}
