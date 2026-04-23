import {
  getAgentPool,
  getAgentPoolEntryById,
  type InternalAgentProfile,
} from "./get-agent-pool";

export type SelectRoundAgentsInput = {
  agentIds?: string[];
};

// Round 层只负责“挑谁参赛”，不负责维护公开 agent 身份。
// 现在先默认拿 Agent Pool 里排名最前的两名选手，后面可以接匹配逻辑。
export async function selectRoundAgents(
  input: SelectRoundAgentsInput = {},
): Promise<InternalAgentProfile[]> {
  if (input.agentIds?.length) {
    const selected = (
      await Promise.all(
        [...new Set(input.agentIds)].map((agentId) =>
          getAgentPoolEntryById(agentId),
        ),
      )
    ).filter((agent): agent is InternalAgentProfile => agent !== null);

    if (selected.length >= 2) {
      return selected.slice(0, 2);
    }
  }

  return getAgentPool({ limit: 2 });
}
