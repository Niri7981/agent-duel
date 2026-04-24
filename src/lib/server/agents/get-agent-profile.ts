import {
  getAgentPoolEntryById,
  type InternalAgentProfile,
} from "./get-agent-pool";
import type { BattleRecord } from "@/lib/server/battles/types";
import { getBattleHistory } from "@/lib/server/battles/get-battle-history";

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

// 这里在干嘛：
// 把 battle 层的统一记录，翻译成“某个具体 agent 视角下的一条 battle history”。
// 为什么这么写：
// battle layer 已经把 round 翻译成统一 BattleRecord 了，
// 这里进一步做“个人视角”的转换，供 profile 页面使用。
// profile 页面需要的是“站在这个 agent 的视角”去看：
// 我押了哪边、对手是谁、我是赢是输、我赚了多少、我当时的理由是什么。
// 所以这里再做一次面向 profile 的派生映射。
// 最后返回什么：
// 如果这场 battle 能映射到当前 agent，就返回一条 AgentBattleHistoryEntry；
// 如果映射不上，就返回 null。
function mapBattleRecordToHistoryEntry(
  battle: BattleRecord,
  agent: InternalAgentProfile,
): AgentBattleHistoryEntry | null {
  const selfAgent = battle.participants.find(
    (entry) => entry.agentId === agent.identityKey,
  );

  if (!selfAgent) {
    return null;
  }

  const opponentAgent = battle.participants.find(
    (entry) => entry.agentId !== selfAgent.agentId,
  );

  if (!opponentAgent) {
    return null;
  }

  return {
    opponentAgentId: opponentAgent.agentId,
    opponentBalance: opponentAgent.finalBalance,
    opponentName: opponentAgent.name,
    opponentSide: opponentAgent.side,
    outcome: battle.outcome,
    ownBalance: selfAgent.finalBalance,
    ownReason: selfAgent.reason,
    ownSide: selfAgent.side,
    ownSizeUsd: selfAgent.sizeUsd,
    pnlUsd: selfAgent.pnlUsd,
    question: battle.question,
    resolutionSource: battle.resolutionSource,
    result:
      battle.roundStatus !== "settled"
        ? "pending"
        : battle.winningAgentId == null
          ? "draw"
          : battle.winningAgentId === agent.identityKey
            ? "win"
            : "loss",
    roundId: battle.roundId,
    roundStatus: battle.roundStatus,
    settledAt: battle.settledAt,
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

  const battles = await getBattleHistory({
    agentIdentityKey: agent.identityKey,
  });

  const recentBattles = battles
    .map((battle) => mapBattleRecordToHistoryEntry(battle, agent))
    .filter((entry): entry is AgentBattleHistoryEntry => entry !== null);
  const matchesPlayed = agent.totalWins + agent.totalLosses;

  return {
    agent,
    matchesPlayed,
    recentBattles,
    winRate: matchesPlayed === 0 ? null : agent.totalWins / matchesPlayed,
  };
}
