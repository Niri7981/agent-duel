import { AGENT_POOL } from "./agent-pool-data";
import type { AgentPoolEntry, GetAgentPoolInput } from "./types";

export type { AgentPoolEntry, AgentPoolRiskProfile } from "./types";

export function getAgentPool(input: GetAgentPoolInput = {}) {
  const filtered = AGENT_POOL.filter((agent) => {
    if (input.runtimeKey && agent.runtimeKey !== input.runtimeKey) {
      return false;
    }

    return true;
  }).sort((left, right) => left.currentRank - right.currentRank);

  return typeof input.limit === "number"
    ? filtered.slice(0, Math.max(0, input.limit))
    : filtered;
}

export function getTopAgentPool(limit = 3) {
  return getAgentPool({ limit });
}

export function getAgentPoolEntryById(agentId: string): AgentPoolEntry | null {
  return AGENT_POOL.find((agent) => agent.id === agentId) ?? null;
}

export function getAgentPoolEntryByRuntimeKey(
  runtimeKey: string,
): AgentPoolEntry | null {
  return AGENT_POOL.find((agent) => agent.runtimeKey === runtimeKey) ?? null;
}
