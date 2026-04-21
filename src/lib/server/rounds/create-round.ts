import { prisma } from "@/lib/db/prisma";
import { decideAction } from "@/lib/engine/decide-action";
import type { ArenaEvent } from "@/lib/types/event";

import { buildDemoMarket } from "./demo-market";

export type CreateRoundInput = {
  bankrollPerAgent?: number;
  durationSeconds?: number;
  marketSymbol?: string;
  startsAt?: Date;
};

const DEFAULT_BANKROLL_PER_AGENT = 10;

// MVP 阶段先固定两名内置 agent，保证整条 duel loop 足够清晰。
const BUILT_IN_AGENTS = [
  {
    agentKey: "momentum",
    name: "Momentum Agent",
    riskProfile: "medium",
    style: "Trend following",
  },
  {
    agentKey: "contrarian",
    name: "Contrarian Agent",
    riskProfile: "medium",
    style: "Crowd fading",
  },
] as const;

// 创建一场最小可运行的 duel：
// 1. 生成事件
// 2. 创建 round 主记录
// 3. 挂上两名参赛 agent
// 4. 让 agent 立即产出 action
// 5. 初始化一条 pending settlement
export async function createRound(input: CreateRoundInput = {}) {
  const bankrollPerAgent =
    input.bankrollPerAgent ?? DEFAULT_BANKROLL_PER_AGENT;

  // 这里先用确定性的 demo market 数据，后面可以平滑替换成真实价格源。
  const market = buildDemoMarket({
    durationSeconds: input.durationSeconds,
    marketSymbol: input.marketSymbol,
    startsAt: input.startsAt,
  });
  const roundEvent: Omit<ArenaEvent, "id"> = {
    outcome: "pending",
    question: market.question,
    resolutionSource: market.resolutionSource,
  };

  return prisma.$transaction(async (tx) => {
    // Round 是整场对局的主表，先把时间、预算和状态固定下来。
    const round = await tx.round.create({
      data: {
        bankrollPerAgent,
        durationSeconds: Math.floor(
          (market.endsAt.getTime() - market.startsAt.getTime()) / 1000,
        ),
        endsAt: market.endsAt,
        marketSymbol: market.marketSymbol,
        startsAt: market.startsAt,
        status: "live",
      },
    });

    // 每场 round 只挂一个 event，表示这局到底在赌什么。
    const event = await tx.roundEvent.create({
      data: {
        outcome: roundEvent.outcome,
        question: roundEvent.question,
        resolutionSource: roundEvent.resolutionSource,
        roundId: round.id,
        startPrice: market.startPrice,
      },
    });

    const createdAgents: Array<{ agentKey: string; id: string }> = [];

    for (const agent of BUILT_IN_AGENTS) {
      // RoundAgent 记录的是“某个 agent 参加这一局”的身份，不是全局 agent 模板。
      const createdAgent = await tx.roundAgent.create({
        data: {
          agentKey: agent.agentKey,
          name: agent.name,
          riskProfile: agent.riskProfile,
          roundId: round.id,
          startingBalance: bankrollPerAgent,
          style: agent.style,
        },
      });

      createdAgents.push({
        agentKey: createdAgent.agentKey,
        id: createdAgent.id,
      });
    }

    const eventInput: ArenaEvent = {
      ...roundEvent,
      id: event.id,
    };

    for (const agent of createdAgents) {
      // agent runtime 只负责给出决策，真正的落库由服务层完成。
      const decision = decideAction({
        agentId: agent.agentKey,
        bankrollUsd: bankrollPerAgent,
        currentPrice: market.currentPrice,
        event: eventInput,
      });

      await tx.action.create({
        data: {
          reason: decision.reason,
          roundAgentId: agent.id,
          roundId: round.id,
          side: decision.side,
          sizeUsd: decision.sizeUsd,
        },
      });
    }

    // 先创建一条 pending settlement，后面真正结算时只更新这条记录。
    await tx.settlement.create({
      data: {
        outcome: "pending",
        roundId: round.id,
        status: "pending",
      },
    });

    // 创建完成后把整场 round 的关联数据一次性带回，方便 API 直接继续映射。
    return tx.round.findUniqueOrThrow({
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
      where: {
        id: round.id,
      },
    });
  });
}
