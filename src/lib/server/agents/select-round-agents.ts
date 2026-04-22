import {
  getAgentPool,
  getAgentPoolEntryById,
  type AgentPoolEntry,
} from "./get-agent-pool";

export type SelectRoundAgentsInput = {
  agentIds?: string[];
};

// Round 层只负责“挑谁参赛”，不负责维护公开 agent 身份。
// 现在先默认拿 Agent Pool 里排名最前的两名选手，后面可以接匹配逻辑。
export function selectRoundAgents(
  input: SelectRoundAgentsInput = {},
): AgentPoolEntry[] {
  if (input.agentIds?.length) {
    const selected = [...new Set(input.agentIds)]
      .map((agentId) => getAgentPoolEntryById(agentId))
      .filter((agent): agent is AgentPoolEntry => agent !== null);

    if (selected.length >= 2) {
      return selected.slice(0, 2);
    }
  }

  return getAgentPool({ limit: 2 });
}
