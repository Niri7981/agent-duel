import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

import type {
  BattleOutcome,
  BattleParticipantRecord,
  BattleParticipantSide,
  BattleRecord,
  BattleStatus,
} from "./types";

type GetBattleHistoryInput = {
  agentIdentityKey?: string;
  limit?: number;
  status?: BattleStatus;
};

type BattleRoundRecord = Prisma.RoundGetPayload<{
  include: {
    actions: true;
    agents: true;
    event: true;
    settlement: true;
  };
}>;

const battleRoundInclude = {
  actions: {
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
  },
  agents: {
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
  },
  event: true,
  settlement: true,
} satisfies Prisma.RoundInclude;

// 这里在干嘛：
// 把数据库里的 outcome 字符串收敛成 battle 记录真正使用的三种状态。
// 为什么这么写：
// battle record 层希望暴露稳定的输出类型，不让上层继续处理任意 string。
// 最后返回什么：
// 返回 "yes"、"no" 或 "pending"。
function normalizeOutcome(outcome: string | null | undefined): BattleOutcome {
  if (outcome === "yes" || outcome === "no") {
    return outcome;
  }

  return "pending";
}

// 这里在干嘛：
// 把 action side 收敛成 battle participant 可消费的标准 side。
// 为什么这么写：
// participant 记录只需要 yes/no/null，避免把数据库原始字符串继续往外泄漏。
// 最后返回什么：
// 返回 "yes"、"no" 或 null。
function normalizeParticipantSide(
  side: string | null | undefined,
): BattleParticipantSide {
  if (side === "yes" || side === "no") {
    return side;
  }

  return null;
}

// 这里在干嘛：
// 把 round 里的某个参赛者快照翻译成 battle record 里的 participant 记录。
// 为什么这么写：
// battle record 需要统一呈现每个参赛者的下注、理由、余额变化和是否获胜。
// 这些信息分散在 RoundAgent、Action、Settlement 上，所以这里做一次聚合。
// 最后返回什么：
// 返回一条 BattleParticipantRecord。
function mapAgentToBattleParticipant(
  round: BattleRoundRecord,
  agent: BattleRoundRecord["agents"][number],
): BattleParticipantRecord {
  const action = round.actions.find((entry) => entry.roundAgentId === agent.id);
  const finalBalance = agent.finalBalance ?? agent.startingBalance;
  const riskProfile =
    agent.riskProfile === "low" ||
    agent.riskProfile === "medium" ||
    agent.riskProfile === "high"
      ? agent.riskProfile
      : "medium";

  return {
    agentId: agent.agentKey,
    finalBalance,
    isWinner:
      round.settlement?.winnerAgentKey != null &&
      round.settlement.winnerAgentKey === agent.agentKey,
    name: agent.name,
    pnlUsd: finalBalance - agent.startingBalance,
    reason: action?.reason ?? null,
    riskProfile,
    side: normalizeParticipantSide(action?.side),
    sizeUsd: action?.sizeUsd ?? null,
    startingBalance: agent.startingBalance,
    style: agent.style,
  };
}

// 这里在干嘛：
// 把一整场 round 记录翻译成 battle 层统一使用的 BattleRecord。
// 为什么这么写：
// battle history、单场 battle API、后续 proof 层都应该依赖同一个稳定 shape，
// 而不是各自直接拼 Round / Action / Settlement。
// 最后返回什么：
// 返回一条 BattleRecord。
export function mapRoundToBattleRecord(round: BattleRoundRecord): BattleRecord {
  return {
    createdAt: round.createdAt.toISOString(),
    finalBalance: round.settlement?.finalBalance ?? null,
    marketSymbol: round.marketSymbol,
    outcome: normalizeOutcome(round.event?.outcome),
    participants: round.agents.map((agent) =>
      mapAgentToBattleParticipant(round, agent),
    ),
    pnlUsd: round.settlement?.pnlUsd ?? null,
    question: round.event?.question ?? "Pending duel event",
    resolutionSource: round.event?.resolutionSource ?? "Pending source",
    roundId: round.id,
    roundStatus: round.status === "settled" ? "settled" : "live",
    settledAt: round.settlement?.settledAt?.toISOString() ?? null,
    winningAgentId: round.settlement?.winnerAgentKey ?? null,
    winningAgentName: round.settlement?.winnerName ?? null,
    winningSide:
      round.settlement?.winningSide === "yes" ||
      round.settlement?.winningSide === "no"
        ? round.settlement.winningSide
        : null,
  };
}

// 这里在干嘛：
// 读取 battle history 列表，并可按 agent 身份或状态做过滤。
// 为什么这么写：
// battle history 不应该继续只挂在 agent profile 下面，
// 需要一个独立服务入口给前端列表、profile、后续 proof 层复用。
// 最后返回什么：
// 返回一个 BattleRecord 数组。
export async function getBattleHistory(
  input: GetBattleHistoryInput = {},
): Promise<BattleRecord[]> {
  const rounds = await prisma.round.findMany({
    include: battleRoundInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit,
    where: {
      agents: input.agentIdentityKey
        ? {
            some: {
              agentKey: input.agentIdentityKey,
            },
          }
        : undefined,
      status: input.status,
    },
  });

  return rounds.map((round) => mapRoundToBattleRecord(round));
}

