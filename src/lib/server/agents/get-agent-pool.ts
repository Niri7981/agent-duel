import { prisma } from "@/lib/db/prisma";

import type { GetAgentPoolInput, InternalAgentProfile } from "./types";

export type { AgentPoolRiskProfile, InternalAgentProfile } from "./types";

type AgentProfileRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.agentProfile.findFirst>>
>;

function mapRecordToAgentProfile(
  record: AgentProfileRecord,
): InternalAgentProfile {
  return {
    avatarSeed: record.avatarSeed,
    badge: record.badge,
    bestStreak: record.bestStreak,
    currentRank: record.currentRank,
    currentStreak: record.currentStreak,
    id: record.id,
    identityKey: record.identityKey,
    isActive: record.isActive,
    name: record.name,
    riskProfile: record.riskProfile as InternalAgentProfile["riskProfile"],
    runtimeKey: record.runtimeKey,
    style: record.style,
    tagline: record.tagline,
    totalLosses: record.totalLosses,
    totalWins: record.totalWins,
  };
}

export async function getAgentPool(input: GetAgentPoolInput = {}) {
  const records = await prisma.agentProfile.findMany({
    orderBy: [{ currentRank: "asc" }, { totalWins: "desc" }, { name: "asc" }],
    take: input.limit,
    where: {
      isActive: input.includeInactive ? undefined : true,
      runtimeKey: input.runtimeKey,
    },
  });

  return records.map((record) => mapRecordToAgentProfile(record));
}

export async function getTopAgentPool(limit = 3) {
  return getAgentPool({ limit });
}

export async function getAgentPoolEntryById(
  agentId: string,
): Promise<InternalAgentProfile | null> {
  const record = await prisma.agentProfile.findUnique({
    where: {
      id: agentId,
    },
  });

  return record ? mapRecordToAgentProfile(record) : null;
}

export async function getAgentPoolEntryByIdentityKey(
  identityKey: string,
): Promise<InternalAgentProfile | null> {
  const record = await prisma.agentProfile.findUnique({
    where: {
      identityKey,
    },
  });

  return record ? mapRecordToAgentProfile(record) : null;
}

export async function getAgentPoolEntryByRuntimeKey(
  runtimeKey: string,
): Promise<InternalAgentProfile | null> {
  const record = await prisma.agentProfile.findFirst({
    orderBy: [{ currentRank: "asc" }, { totalWins: "desc" }],
    where: {
      isActive: true,
      runtimeKey,
    },
  });

  return record ? mapRecordToAgentProfile(record) : null;
}
