import { prisma } from "@/lib/db/prisma";

import { AGENT_POOL } from "./agent-pool-data";
import type { InternalAgentProfile, SeedAgentPoolResult } from "./types";

// 这里的种子项允许把 brainSwappedAt 写成 ISO 字符串，
// 写库前会被 mapper 转成 Date。
type AgentPoolSeedItem = Omit<
  InternalAgentProfile,
  "id" | "rankDelta" | "brainSwappedAt"
> & {
  brainSwappedAt: string | null;
};

type SeedAgentPoolInput = {
  agents?: AgentPoolSeedItem[];
};

function toDbBrainSwappedAt(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function brainFieldsEqual(
  existingValue: Date | string | null,
  incomingValue: string | null,
) {
  if (existingValue == null && incomingValue == null) {
    return true;
  }

  if (existingValue == null || incomingValue == null) {
    return false;
  }

  const existingIso =
    existingValue instanceof Date
      ? existingValue.toISOString()
      : new Date(existingValue).toISOString();
  const incomingIso = new Date(incomingValue).toISOString();

  return existingIso === incomingIso;
}

// agent-proof 的 seed 层负责把"公开参赛者身份"写进 arena 自己的池子。
// 这里写进去的是 public identity，不是底层 runtime 的实现细节。
//
// brain 字段（brainProvider / brainModel / brainSwappedAt）也通过 seed 进入数据库，
// 这样前端展示和 API 响应都能看到 “Agent 当前底层挂的是什么大脑”。
export async function seedAgentPool(
  input: SeedAgentPoolInput = {},
): Promise<SeedAgentPoolResult> {
  const agents = input.agents ?? AGENT_POOL;
  let inserted = 0;
  let skipped = 0;
  let updated = 0;

  await prisma.$transaction(async (tx) => {
    for (const agent of agents) {
      const existing = await tx.agentProfile.findUnique({
        where: {
          identityKey: agent.identityKey,
        },
      });

      const dbBrainSwappedAt = toDbBrainSwappedAt(agent.brainSwappedAt);

      if (
        existing &&
        existing.runtimeKey === agent.runtimeKey &&
        existing.name === agent.name &&
        existing.avatarSeed === agent.avatarSeed &&
        existing.style === agent.style &&
        existing.riskProfile === agent.riskProfile &&
        existing.badge === agent.badge &&
        existing.currentRank === agent.currentRank &&
        existing.previousRank === agent.previousRank &&
        existing.totalWins === agent.totalWins &&
        existing.totalLosses === agent.totalLosses &&
        existing.currentStreak === agent.currentStreak &&
        existing.bestStreak === agent.bestStreak &&
        existing.tagline === agent.tagline &&
        existing.isActive === agent.isActive &&
        existing.brainProvider === agent.brainProvider &&
        existing.brainModel === agent.brainModel &&
        brainFieldsEqual(existing.brainSwappedAt, agent.brainSwappedAt)
      ) {
        skipped += 1;
        continue;
      }

      const dbPayload = {
        avatarSeed: agent.avatarSeed,
        badge: agent.badge,
        bestStreak: agent.bestStreak,
        brainModel: agent.brainModel,
        brainProvider: agent.brainProvider,
        brainSwappedAt: dbBrainSwappedAt,
        currentRank: agent.currentRank,
        currentStreak: agent.currentStreak,
        identityKey: agent.identityKey,
        isActive: agent.isActive,
        name: agent.name,
        previousRank: agent.previousRank,
        riskProfile: agent.riskProfile,
        runtimeKey: agent.runtimeKey,
        style: agent.style,
        tagline: agent.tagline,
        totalLosses: agent.totalLosses,
        totalWins: agent.totalWins,
      };

      await tx.agentProfile.upsert({
        create: dbPayload,
        update: dbPayload,
        where: {
          identityKey: agent.identityKey,
        },
      });

      if (existing) {
        updated += 1;
      } else {
        inserted += 1;
      }
    }
  });

  return {
    inserted,
    skipped,
    updated,
  };
}
