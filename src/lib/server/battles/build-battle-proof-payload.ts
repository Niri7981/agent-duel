import type { AgentProfile } from "@/generated/prisma/client";

import type { PersistedRoundRecord } from "@/lib/server/rounds/get-latest-round";

import type {
  BattleOutcome,
  BattleParticipantSide,
  BattleProofPayload,
} from "./types";

type SettlementComputationSnapshot = {
  finalBalance: number;
  pnlUsd: number;
  winnerAgentKey: string | null;
  winnerName: string;
  winningSide: "yes" | "no" | null;
};

type ProfileSnapshot = Pick<
  AgentProfile,
  | "identityKey"
  | "name"
  | "currentRank"
  | "previousRank"
  | "totalWins"
  | "totalLosses"
  | "currentStreak"
  | "bestStreak"
>;

function normalizeOutcome(outcome: string | null | undefined): BattleOutcome {
  if (outcome === "yes" || outcome === "no") {
    return outcome;
  }

  return "pending";
}

function normalizeActionSide(
  side: string | null | undefined,
): BattleParticipantSide {
  if (side === "yes" || side === "no") {
    return side;
  }

  return null;
}

function summarizeReason(reason: string | null | undefined) {
  if (!reason) {
    return null;
  }

  return reason.length <= 180 ? reason : `${reason.slice(0, 177)}...`;
}

// 这里在干嘛：
// 把 settlement 前后的 agent profile 快照，翻译成 proof payload 里的 reputation effect。
// 为什么这么写：
// 链上或外部 proof 层真正关心的，不只是“谁赢了”，
// 还包括“这场 battle 怎么改变了身份状态”。
// 所以这里把 rank、record、streak 的 before/after 明确固化下来。
// 最后返回什么：
// 返回一条 battle proof 里的 reputation effect 记录。
function buildReputationEffect(params: {
  after: ProfileSnapshot;
  before: ProfileSnapshot;
  result: "win" | "loss" | "draw";
}) {
  return {
    bestStreakAfter: params.after.bestStreak,
    bestStreakBefore: params.before.bestStreak,
    identityKey: params.after.identityKey,
    lossesAfter: params.after.totalLosses,
    lossesBefore: params.before.totalLosses,
    name: params.after.name,
    rankAfter: params.after.currentRank,
    rankBefore: params.before.currentRank,
    rankDelta: params.before.currentRank - params.after.currentRank,
    result: params.result,
    streakAfter: params.after.currentStreak,
    streakBefore: params.before.currentStreak,
    winsAfter: params.after.totalWins,
    winsBefore: params.before.totalWins,
  };
}

// 这里在干嘛：
// 把一场已经结算完成的 round，固化成一份 BattleProofPayload。
// 为什么这么写：
// battle history 适合给页面看，但 proof payload 需要更稳定、更明确，
// 方便以后上链、签名或外部校验。
// 这里会把事件快照、参赛者快照、结算结果和 reputation effect 全部固化下来。
// 最后返回什么：
// 返回一份 BattleProofPayload。
export function buildBattleProofPayload(params: {
  afterProfiles: ProfileSnapshot[];
  beforeProfiles: ProfileSnapshot[];
  round: PersistedRoundRecord;
  settlement: SettlementComputationSnapshot;
  settledAt: Date;
}): BattleProofPayload {
  const beforeProfiles = new Map(
    params.beforeProfiles.map((profile) => [profile.identityKey, profile]),
  );
  const afterProfiles = new Map(
    params.afterProfiles.map((profile) => [profile.identityKey, profile]),
  );

  const participants = params.round.agents.map((agent) => {
    const action = params.round.actions.find(
      (entry) => entry.roundAgent.id === agent.id,
    );
    const finalBalance =
      action?.roundAgent.finalBalance ??
      params.round.agents.find((entry) => entry.id === agent.id)?.finalBalance ??
      params.round.bankrollPerAgent;
    const startingBalance =
      params.round.agents.find((entry) => entry.id === agent.id)?.startingBalance ??
      params.round.bankrollPerAgent;

    return {
      finalBalance,
      identityKey: agent.agentKey,
      name: agent.name,
      pnlUsd: finalBalance - startingBalance,
      reasonSummary: summarizeReason(action?.reason),
      side: normalizeActionSide(action?.side),
      sizeUsd: action?.sizeUsd ?? null,
      startingBalance,
    };
  });

  const reputationEffects = params.round.agents.map((agent) => {
    const before = beforeProfiles.get(agent.agentKey);
    const after = afterProfiles.get(agent.agentKey);

    if (!before || !after) {
      throw new Error(
        `Missing profile snapshot while building proof payload for ${agent.agentKey}.`,
      );
    }

    return buildReputationEffect({
      after,
      before,
      result:
        params.settlement.winnerAgentKey == null
          ? "draw"
          : params.settlement.winnerAgentKey === agent.agentKey
            ? "win"
            : "loss",
    });
  });

  return {
    createdAt: params.round.createdAt.toISOString(),
    eventId: params.round.event?.id ?? null,
    finalBalance: params.settlement.finalBalance,
    marketSymbol: params.round.marketSymbol,
    outcome: normalizeOutcome(params.round.event?.outcome),
    participants,
    pnlUsd: params.settlement.pnlUsd,
    proofVersion: 1,
    question: params.round.event?.question ?? "Pending duel event",
    reputationEffects,
    resolutionSource: params.round.event?.resolutionSource ?? "Pending source",
    roundId: params.round.id,
    settledAt: params.settledAt.toISOString(),
    winnerIdentityKey: params.settlement.winnerAgentKey,
    winnerName: params.settlement.winnerName,
    winningSide: params.settlement.winningSide,
  };
}
