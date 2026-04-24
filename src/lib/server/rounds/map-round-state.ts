import type { AgentSummary } from "@/lib/types/agent";
import type { RoundAction } from "@/lib/types/action";
import type { ArenaEvent } from "@/lib/types/event";
import type { BankrollBalance, RoundState } from "@/lib/types/round";
import type { RoundSettlement } from "@/lib/types/settlement";

import type { PersistedRoundRecord } from "./get-latest-round";
import { getAgentPoolEntryByIdentityKey } from "@/lib/server/agents/get-agent-pool";

// 把某个 action 的创建时间，换算成“距离 round 开始已经过了多久”。
function formatElapsedTime(createdAt: Date, startsAt: Date | null) {
  if (!startsAt) {
    return "00:00";
  }

  const elapsedMs = Math.max(createdAt.getTime() - startsAt.getTime(), 0);
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// 从数据库 round 里，提取出页面要显示的 event。
function mapEvent(round: PersistedRoundRecord): ArenaEvent {
  return {
    id: round.event?.id ?? `event-${round.id}`,
    outcome:
      round.event?.outcome === "yes" || round.event?.outcome === "no"
        ? round.event.outcome
        : "pending",
    question: round.event?.question ?? "Pending duel event",
    resolutionSource: round.event?.resolutionSource ?? "Pending source",
  };
}

function mapAgents(round: PersistedRoundRecord): AgentSummary[] {
  return round.agents.map((agent) => ({
    id: agent.agentKey,
    name: agent.name,
    riskProfile:
      agent.riskProfile === "low" ||
      agent.riskProfile === "medium" ||
      agent.riskProfile === "high"
        ? agent.riskProfile
        : "medium",
    style: agent.style,
  }));
}

function mapActions(round: PersistedRoundRecord): RoundAction[] {
  return round.actions.map((action) => ({
    agentId: action.roundAgent.agentKey,
    agentName: action.roundAgent.name,
    at: formatElapsedTime(action.createdAt, round.startsAt),
    id: action.id,
    reason: action.reason,
    side: action.side === "no" ? "no" : "yes",
    sizeUsd: action.sizeUsd,
  }));
}

function mapBalances(round: PersistedRoundRecord): BankrollBalance[] {
  return round.agents.map((agent) => ({
    agentId: agent.agentKey,
    agentName: agent.name,
    usdc: agent.finalBalance ?? agent.startingBalance,
  }));
}

async function mapSettlement(round: PersistedRoundRecord): Promise<RoundSettlement> {
  const winnerAgent = round.agents.find(
    (agent) =>
      round.settlement?.winnerAgentKey &&
      agent.agentKey === round.settlement.winnerAgentKey,
  );
  const fallbackBalance = winnerAgent?.finalBalance ??
    winnerAgent?.startingBalance ??
    round.bankrollPerAgent;
  const winnerProfile =
    round.settlement?.winnerAgentKey == null
      ? null
      : await getAgentPoolEntryByIdentityKey(round.settlement.winnerAgentKey);

  return {
    finalBalance: round.settlement?.finalBalance ?? fallbackBalance,
    pnlUsd: round.settlement?.pnlUsd ?? 0,
    status: round.settlement?.status === "settled" ? "settled" : "pending",
    winnerAgentId: round.settlement?.winnerAgentKey ?? winnerAgent?.agentKey ?? "",
    winnerName: round.settlement?.winnerName ?? winnerAgent?.name ?? "Pending settlement",
    winnerReputation:
      winnerProfile == null
        ? null
        : {
            badge: winnerProfile.badge,
            bestStreak: winnerProfile.bestStreak,
            currentRank: winnerProfile.currentRank,
            currentStreak: winnerProfile.currentStreak,
            identityKey: winnerProfile.identityKey,
            name: winnerProfile.name,
            previousRank: winnerProfile.previousRank,
            rankDelta: winnerProfile.rankDelta,
            totalLosses: winnerProfile.totalLosses,
            totalWins: winnerProfile.totalWins,
          },
  };
}

// 这里专门做“数据库结构 -> 页面结构”的翻译。
// 这样前端不用知道 Prisma 表长什么样，后面改表也不会一路牵连到 UI。
export async function mapRoundToState(round: PersistedRoundRecord): Promise<RoundState> {
  return {
    actions: mapActions(round),
    agents: mapAgents(round),
    balances: mapBalances(round),
    bankrollPerAgent: round.bankrollPerAgent,
    event: mapEvent(round),
    id: round.id,
    settlement: await mapSettlement(round),
    status: round.status === "settled" ? "settled" : "live",
  };
}
