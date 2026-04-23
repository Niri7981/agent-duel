import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { recomputeLeaderboardRanks } from "@/lib/server/leaderboard/recompute-ranks";

import type { PersistedRoundRecord } from "./get-latest-round";
import { resolveDemoMarket } from "./demo-market";

export type SettleRoundInput = {
  roundId?: string;
  settledAt?: Date;
};

type SettlementComputation = {
  finalBalances: Map<string, number>;
  finalBalance: number;
  pnlUsd: number;
  winnerAgentKey: string | null;
  winnerName: string;
  winningSide: "yes" | "no" | null;
};

const roundInclude = {
  actions: {
    include: {
      roundAgent: true,
    },
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
  },
  agents: {
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
  },
  event: true,
  settlement: true,
} satisfies Prisma.RoundInclude;

function buildInitialBalances(round: PersistedRoundRecord) {
  return new Map(
    round.agents.map((agent) => [agent.agentKey, agent.startingBalance]),
  );
}

async function findAgentProfilesForRound(
  tx: Prisma.TransactionClient,
  round: PersistedRoundRecord,
) {
  const agentKeys = [...new Set(round.agents.map((agent) => agent.agentKey))];

  const profiles = await tx.agentProfile.findMany({
    where: {
      OR: [{ identityKey: { in: agentKeys } }, { runtimeKey: { in: agentKeys } }],
    },
  });

  return round.agents.map((agent) => {
    const exactIdentityMatch = profiles.find(
      (profile) => profile.identityKey === agent.agentKey,
    );

    if (exactIdentityMatch) {
      return {
        agent,
        profile: exactIdentityMatch,
      };
    }

    const runtimeMatches = profiles.filter(
      (profile) => profile.runtimeKey === agent.agentKey,
    );

    if (runtimeMatches.length === 1) {
      return {
        agent,
        profile: runtimeMatches[0],
      };
    }

    if (runtimeMatches.length > 1) {
      throw new Error(
        `Round agent ${agent.agentKey} matches multiple agent profiles by runtimeKey.`,
      );
    }

    throw new Error(`No agent profile found for round agent ${agent.agentKey}.`);
  });
}

async function applyAgentReputationUpdate(
  tx: Prisma.TransactionClient,
  round: PersistedRoundRecord,
  winnerAgentKey: string | null,
) {
  const profileMappings = await findAgentProfilesForRound(tx, round);

  for (const { agent, profile } of profileMappings) {
    const isWinner = winnerAgentKey !== null && agent.agentKey === winnerAgentKey;
    const isDraw = winnerAgentKey === null;
    const nextWins = profile.totalWins + (isWinner ? 1 : 0);
    const nextLosses = profile.totalLosses + (!isWinner && !isDraw ? 1 : 0);
    const nextStreak = isWinner
      ? profile.currentStreak + 1
      : isDraw
        ? profile.currentStreak
        : 0;
    const nextBestStreak = Math.max(profile.bestStreak, nextStreak);

    await tx.agentProfile.update({
      data: {
        bestStreak: nextBestStreak,
        currentStreak: nextStreak,
        totalLosses: nextLosses,
        totalWins: nextWins,
      },
      where: {
        id: profile.id,
      },
    });
  }

  await recomputeLeaderboardRanks(tx);
}

// MVP 先按“单场 duel、两个 agent、单次 action”来结算：
// 1. 根据 event outcome 找出押对的一方
// 2. 用双方下注额的最小值作为可撮合仓位
// 3. 赢的一方加 matched stake，输的一方减 matched stake
// 这样规则足够简单，也能保持资金变化可解释。
function computeSettlement(
  round: PersistedRoundRecord,
  outcome: "yes" | "no",
): SettlementComputation {
  const finalBalances = buildInitialBalances(round);
  const winners = round.actions.filter((action) => action.side === outcome);
  const losers = round.actions.filter((action) => action.side !== outcome);

  if (winners.length !== 1 || losers.length !== 1) {
    return {
      finalBalance: round.bankrollPerAgent,
      finalBalances,
      pnlUsd: 0,
      winnerAgentKey: null,
      winnerName: "Draw",
      winningSide: outcome,
    };
  }

  const winner = winners[0];
  const loser = losers[0];
  const matchedStake = Math.min(winner.sizeUsd, loser.sizeUsd);
  const winnerBalance = winner.roundAgent.startingBalance + matchedStake;
  const loserBalance = loser.roundAgent.startingBalance - matchedStake;

  finalBalances.set(winner.roundAgent.agentKey, winnerBalance);
  finalBalances.set(loser.roundAgent.agentKey, loserBalance);

  return {
    finalBalance: winnerBalance,
    finalBalances,
    pnlUsd: winnerBalance - winner.roundAgent.startingBalance,
    winnerAgentKey: winner.roundAgent.agentKey,
    winnerName: winner.roundAgent.name,
    winningSide: outcome,
  };
}

export async function settleRound(
  input: SettleRoundInput = {},
): Promise<PersistedRoundRecord> {
  return prisma.$transaction(async (tx) => {
    const targetRound =
      input.roundId != null
        ? await tx.round.findUnique({
            include: roundInclude,
            where: {
              id: input.roundId,
            },
          })
        : await tx.round.findFirst({
            include: roundInclude,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          });

    if (!targetRound) {
      throw new Error("No round available to settle.");
    }

    if (!targetRound.event) {
      throw new Error("Cannot settle a round without an event.");
    }

    if (targetRound.settlement?.status === "settled") {
      return targetRound;
    }

    const settledAt = input.settledAt ?? new Date();
    const marketResolution = resolveDemoMarket({
      marketSymbol: targetRound.marketSymbol,
      roundId: targetRound.id,
      startPrice: targetRound.event.startPrice,
    });
    const settlement = computeSettlement(targetRound, marketResolution.outcome);

    await tx.round.update({
      data: {
        status: "settled",
      },
      where: {
        id: targetRound.id,
      },
    });

    await tx.roundEvent.update({
      data: {
        endPrice: marketResolution.endPrice,
        outcome: marketResolution.outcome,
      },
      where: {
        id: targetRound.event.id,
      },
    });

    for (const agent of targetRound.agents) {
      await tx.roundAgent.update({
        data: {
          finalBalance:
            settlement.finalBalances.get(agent.agentKey) ?? agent.startingBalance,
        },
        where: {
          id: agent.id,
        },
      });
    }

    if (targetRound.settlement) {
      await tx.settlement.update({
        data: {
          finalBalance: settlement.finalBalance,
          outcome: marketResolution.outcome,
          pnlUsd: settlement.pnlUsd,
          settledAt,
          status: "settled",
          winnerAgentKey: settlement.winnerAgentKey,
          winnerName: settlement.winnerName,
          winningSide: settlement.winningSide,
        },
        where: {
          id: targetRound.settlement.id,
        },
      });
    } else {
      await tx.settlement.create({
        data: {
          finalBalance: settlement.finalBalance,
          outcome: marketResolution.outcome,
          pnlUsd: settlement.pnlUsd,
          roundId: targetRound.id,
          settledAt,
          status: "settled",
          winnerAgentKey: settlement.winnerAgentKey,
          winnerName: settlement.winnerName,
          winningSide: settlement.winningSide,
        },
      });
    }

    await applyAgentReputationUpdate(
      tx,
      targetRound,
      settlement.winnerAgentKey,
    );

    return tx.round.findUniqueOrThrow({
      include: roundInclude,
      where: {
        id: targetRound.id,
      },
    });
  });
}
