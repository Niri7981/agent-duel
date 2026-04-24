import { prisma } from "@/lib/db/prisma";

import type { LeaderboardEntry } from "./types";

type GetLeaderboardInput = {
  includeInactive?: boolean;
  limit?: number;
};

type AgentProfileRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.agentProfile.findFirst>>
>;

// 这里在干嘛：
// 把数据库里的 AgentProfile 记录，翻译成 leaderboard 页面和 API 真正消费的 LeaderboardEntry。
// 为什么这么写：
// 榜单需要的字段和通用 agent profile 不完全一样。
// 这里顺手把 matchesPlayed、winRate 这种展示层强相关的派生值也一起算出来，
// 避免页面自己重复计算。
// 最后返回什么：
// 返回一条 LeaderboardEntry。
function mapRecordToLeaderboardEntry(
  record: AgentProfileRecord,
): LeaderboardEntry {
  const matchesPlayed = record.totalWins + record.totalLosses;
  const previousRank = record.previousRank;
  const rankDelta =
    previousRank == null ? 0 : previousRank - record.currentRank;

  return {
    avatarSeed: record.avatarSeed,
    badge: record.badge,
    bestStreak: record.bestStreak,
    currentRank: record.currentRank,
    currentStreak: record.currentStreak,
    id: record.id,
    identityKey: record.identityKey,
    isActive: record.isActive,
    matchesPlayed,
    name: record.name,
    previousRank,
    rankDelta,
    riskProfile: record.riskProfile as LeaderboardEntry["riskProfile"],
    runtimeKey: record.runtimeKey,
    style: record.style,
    tagline: record.tagline,
    totalLosses: record.totalLosses,
    totalWins: record.totalWins,
    winRate: matchesPlayed === 0 ? null : record.totalWins / matchesPlayed,
  };
}

// 这里在干嘛：
// 读取当前 leaderboard 的公开榜单数据。
// 为什么这么写：
// leaderboard 是一个独立产品面，不应该直接暴露裸 AgentProfile 记录。
// 这里统一处理 active 过滤、limit 截断、排序和 shape 映射，
// 让 API 和页面都通过同一个服务入口拿榜单。
// 最后返回什么：
// 返回一个按当前 rank 顺序排好的 LeaderboardEntry 数组。
export async function getLeaderboard(input: GetLeaderboardInput = {}) {
  const records = await prisma.agentProfile.findMany({
    orderBy: [
      { currentRank: "asc" },
      { totalWins: "desc" },
      { currentStreak: "desc" },
      { name: "asc" },
    ],
    take: input.limit,
    where: {
      isActive: input.includeInactive ? undefined : true,
    },
  });

  return records.map((record) => mapRecordToLeaderboardEntry(record));
}
