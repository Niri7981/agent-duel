import { prisma } from "@/lib/db/prisma";

import { AGENT_POOL } from "./agent-pool-data";
import type { InternalAgentProfile, SeedAgentPoolResult } from "./types";

type SeedAgentPoolInput = {
  agents?: Array<Omit<InternalAgentProfile, "id">>;
};

// agent-proof 的 seed 层负责把“公开参赛者身份”写进 arena 自己的池子。
// 这里写进去的是 public identity，不是底层 runtime 的实现细节。
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

      if (
        existing &&
        existing.runtimeKey === agent.runtimeKey &&
        existing.name === agent.name &&
        existing.avatarSeed === agent.avatarSeed &&
        existing.style === agent.style &&
        existing.riskProfile === agent.riskProfile &&
        existing.badge === agent.badge &&
        existing.currentRank === agent.currentRank &&
        existing.totalWins === agent.totalWins &&
        existing.totalLosses === agent.totalLosses &&
        existing.currentStreak === agent.currentStreak &&
        existing.bestStreak === agent.bestStreak &&
        existing.tagline === agent.tagline &&
        existing.isActive === agent.isActive
      ) {
        skipped += 1;
        continue;
      }

      await tx.agentProfile.upsert({
        create: agent,
        update: agent,
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
