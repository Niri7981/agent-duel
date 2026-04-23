import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

import {
  getAgentPoolEntryById,
  type InternalAgentProfile,
} from "./get-agent-pool";

export type AgentBattleHistoryEntry = {
  roundId: string;
  roundStatus: "live" | "settled";
  settledAt: string | null;
  question: string;
  resolutionSource: string;
  outcome: "yes" | "no" | "pending";
  ownSide: "yes" | "no" | null;
  ownReason: string | null;
  ownSizeUsd: number | null;
  ownBalance: number;
  opponentAgentId: string;
  opponentName: string;
  opponentSide: "yes" | "no" | null;
  opponentBalance: number;
  result: "win" | "loss" | "draw" | "pending";
  pnlUsd: number;
};

export type AgentProfilePayload = {
  agent: InternalAgentProfile;
  matchesPlayed: number;
  winRate: number | null;
  recentBattles: AgentBattleHistoryEntry[];
};

type AgentRoundRecord = Prisma.RoundGetPayload<{
  include: {
    actions: true;
    agents: true;
    event: true;
    settlement: true;
  };
}>;

// 这里在干嘛：
// 把数据库里 event 的 outcome 字段收敛成页面真正会用的三种状态。
// 为什么这么写：
// 数据库里是 string，理论上可能出现 pending 或别的中间值；
// 这里统一把非 yes/no 的情况压成 pending，减少上层判断分支。
// 最后返回什么：
// 返回 "yes"、"no" 或 "pending" 三选一。
function normalizeOutcome(outcome: string | null | undefined) {
  if (outcome === "yes" || outcome === "no") {
    return outcome;
  }

  return "pending";
}

// 这里在干嘛：
// 把 action 的下注方向收敛成我们页面只关心的标准 side。
// 为什么这么写：
// battle history 展示层不应该直接暴露数据库原始 string，
// 而应该拿到一个明确可消费的 yes/no/null。
// 最后返回什么：
// 返回 "yes"、"no" 或 null。
function normalizeActionSide(side: string | null | undefined) {
  if (side === "yes" || side === "no") {
    return side;
  }

  return null;
}

// 这里在干嘛：
// 根据 settlement 的赢家键，判断这场 battle 对当前 agent 来说是 win、loss、draw 还是 pending。
// 为什么这么写：
// profile history 最核心的一列就是“这场我到底赢了没”，
// 这个判断最好集中在一个小函数里，不要散落在页面里。
// 最后返回什么：
// 返回 "win"、"loss"、"draw" 或 "pending"。
function deriveResult(
  round: AgentRoundRecord,
  agentIdentityKey: string,
): AgentBattleHistoryEntry["result"] {
  if (round.settlement?.status !== "settled") {
    return "pending";
  }

  if (!round.settlement.winnerAgentKey) {
    return "draw";
  }

  return round.settlement.winnerAgentKey === agentIdentityKey ? "win" : "loss";
}

// 这里在干嘛：
// 把一整场 round 记录翻译成“某个具体 agent 视角下的一条 battle history”。
// 为什么这么写：
// round 本身是全局记录，但 profile 页面需要的是“站在这个 agent 的视角”去看：
// 我押了哪边、对手是谁、我是赢是输、我赚了多少、我当时的理由是什么。
// 所以这里做一次面向 profile 的派生映射。
// 另外这里兼容了旧 round 数据：
// 优先按 identityKey 命中；如果是旧数据，再退回 runtimeKey + name 的组合。
// 最后返回什么：
// 如果这场 round 能映射到当前 agent，就返回一条 AgentBattleHistoryEntry；
// 如果映射不上，就返回 null。
function mapRoundToHistoryEntry(
  round: AgentRoundRecord,
  agent: InternalAgentProfile,
): AgentBattleHistoryEntry | null {
  const selfAgent = round.agents.find(
    (entry) =>
      entry.agentKey === agent.identityKey ||
      (entry.agentKey === agent.runtimeKey && entry.name === agent.name),
  );

  if (!selfAgent) {
    return null;
  }

  const opponentAgent = round.agents.find((entry) => entry.id !== selfAgent.id);

  if (!opponentAgent) {
    return null;
  }

  const ownAction = round.actions.find(
    (action) => action.roundAgentId === selfAgent.id,
  );
  const opponentAction = round.actions.find(
    (action) => action.roundAgentId === opponentAgent.id,
  );
  const ownBalance = selfAgent.finalBalance ?? selfAgent.startingBalance;
  const baseBalance = selfAgent.startingBalance;

  return {
    opponentAgentId: opponentAgent.agentKey,
    opponentBalance: opponentAgent.finalBalance ?? opponentAgent.startingBalance,
    opponentName: opponentAgent.name,
    opponentSide: normalizeActionSide(opponentAction?.side),
    outcome: normalizeOutcome(round.event?.outcome),
    ownBalance,
    ownReason: ownAction?.reason ?? null,
    ownSide: normalizeActionSide(ownAction?.side),
    ownSizeUsd: ownAction?.sizeUsd ?? null,
    pnlUsd: ownBalance - baseBalance,
    question: round.event?.question ?? "Pending duel event",
    resolutionSource: round.event?.resolutionSource ?? "Pending source",
    result: deriveResult(round, agent.identityKey),
    roundId: round.id,
    roundStatus: round.status === "settled" ? "settled" : "live",
    settledAt: round.settlement?.settledAt?.toISOString() ?? null,
  };
}

// 这里在干嘛：
// 读取一个公开 agent 的完整 profile payload：
// 基础身份、reputation 摘要，以及最近 battle history。
// 为什么这么写：
// 个人主页不该自己去拼很多零散查询，
// 最好由服务层一次性返回“页面真正需要的完整 shape”。
// 这也让 API route 和 server page 都可以复用同一个后端聚合逻辑。
// 最后返回什么：
// 找到 agent 时，返回 AgentProfilePayload；
// 找不到时返回 null，让上层决定是否 404。
export async function getAgentProfile(
  agentId: string,
): Promise<AgentProfilePayload | null> {
  const agent = await getAgentPoolEntryById(agentId);

  if (!agent) {
    return null;
  }

  const rounds = await prisma.round.findMany({
    include: {
      actions: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      agents: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      event: true,
      settlement: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: {
      agents: {
        some: {
          OR: [
            { agentKey: agent.identityKey },
            {
              agentKey: agent.runtimeKey,
              name: agent.name,
            },
          ],
        },
      },
    },
  });

  const recentBattles = rounds
    .map((round) => mapRoundToHistoryEntry(round, agent))
    .filter((entry): entry is AgentBattleHistoryEntry => entry !== null);
  const matchesPlayed = agent.totalWins + agent.totalLosses;

  return {
    agent,
    matchesPlayed,
    recentBattles,
    winRate: matchesPlayed === 0 ? null : agent.totalWins / matchesPlayed,
  };
}
