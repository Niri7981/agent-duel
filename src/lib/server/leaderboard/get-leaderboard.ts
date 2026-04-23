import { prisma } from "@/lib/db/prisma";

import type { LeaderboardEntry } from "./types";

type GetLeaderboardInput = {
  includeInactive?: boolean;
  limit?: number;
};

type AgentProfileRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.agentProfile.findFirst>>
>;

function mapRecordToLeaderboardEntry(
  record: AgentProfileRecord,
): LeaderboardEntry {
  const matchesPlayed = record.totalWins + record.totalLosses;

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
    riskProfile: record.riskProfile as LeaderboardEntry["riskProfile"],
    runtimeKey: record.runtimeKey,
    style: record.style,
    tagline: record.tagline,
    totalLosses: record.totalLosses,
    totalWins: record.totalWins,
    winRate: matchesPlayed === 0 ? null : record.totalWins / matchesPlayed,
  };
}

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

