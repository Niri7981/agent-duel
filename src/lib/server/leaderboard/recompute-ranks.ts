import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

type AgentProfileRecord = Prisma.AgentProfileGetPayload<object>;

type RankWriteClient = Prisma.TransactionClient | PrismaClient;

function compareAgents(a: AgentProfileRecord, b: AgentProfileRecord) {
  if (a.totalWins !== b.totalWins) {
    return b.totalWins - a.totalWins;
  }

  if (a.currentStreak !== b.currentStreak) {
    return b.currentStreak - a.currentStreak;
  }

  if (a.bestStreak !== b.bestStreak) {
    return b.bestStreak - a.bestStreak;
  }

  if (a.totalLosses !== b.totalLosses) {
    return a.totalLosses - b.totalLosses;
  }

  if (a.createdAt.getTime() !== b.createdAt.getTime()) {
    return a.createdAt.getTime() - b.createdAt.getTime();
  }

  return a.name.localeCompare(b.name);
}

export function sortAgentsForLeaderboard(records: AgentProfileRecord[]) {
  return [...records].sort(compareAgents);
}

export async function recomputeLeaderboardRanks(client: RankWriteClient = prisma) {
  const activeAgents = await client.agentProfile.findMany({
    orderBy: [{ currentRank: "asc" }, { name: "asc" }],
    where: {
      isActive: true,
    },
  });

  const rankedAgents = sortAgentsForLeaderboard(activeAgents);

  for (const [index, agent] of rankedAgents.entries()) {
    const nextRank = index + 1;

    if (agent.currentRank === nextRank) {
      continue;
    }

    await client.agentProfile.update({
      data: {
        currentRank: nextRank,
      },
      where: {
        id: agent.id,
      },
    });
  }

  return rankedAgents.map((agent, index) => ({
    ...agent,
    currentRank: index + 1,
  }));
}

