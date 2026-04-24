import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

type AgentProfileRecord = Prisma.AgentProfileGetPayload<object>;

type RankWriteClient = Prisma.TransactionClient | PrismaClient;

// 这里在干嘛：
// 定义两个 agent 在 leaderboard 上谁应该排前面的比较规则。
// 为什么这么写：
// 当前 MVP 还没有上 Elo 或更复杂的 rating，
// 所以这里用一套简单、稳定、可解释的排序规则来重排名次。
// 这个比较器集中放在一个函数里，后面如果要升级 reputation 规则，只改这里就够了。
// 最后返回什么：
// 返回一个标准 sort comparator 结果：负数表示 a 在前，正数表示 b 在前，0 表示相等。
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

// 这里在干嘛：
// 按 leaderboard 规则把一组 agent 排序。
// 为什么这么写：
// 把“排序规则”与“数据库写回”拆开，
// 这样既方便单独复用排序逻辑，也让重排函数更清晰。
// 最后返回什么：
// 返回一个新的、排好序的 AgentProfileRecord 数组，不会修改传入数组本身。
export function sortAgentsForLeaderboard(records: AgentProfileRecord[]) {
  return [...records].sort(compareAgents);
}

// 这里在干嘛：
// 读取所有活跃 agent，按当前规则重排，然后把新的 currentRank 回写到数据库。
// 为什么这么写：
// leaderboard 的本质不是“临时排序一下”，而是要把 rank 变成公开身份状态的一部分。
// 所以每次 settlement 之后，需要有一个统一入口真正回写 rank。
// client 参数允许它既能独立运行，也能在 transaction 里复用同一个 Prisma client。
// 最后返回什么：
// 返回排好序、并带最新 currentRank 的 agent 列表。
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
    const previousRank = agent.currentRank;

    if (agent.currentRank === nextRank && agent.previousRank === previousRank) {
      continue;
    }

    await client.agentProfile.update({
      data: {
        currentRank: nextRank,
        previousRank,
      },
      where: {
        id: agent.id,
      },
    });
  }

  return rankedAgents.map((agent, index) => ({
    ...agent,
    currentRank: index + 1,
    previousRank: agent.currentRank,
  }));
}
