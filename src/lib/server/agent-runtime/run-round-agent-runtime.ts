import type {
  AgentRuntimeDecision,
  AgentRuntimeRawDecision,
  AgentRuntimeParticipant,
} from "./types";
import { getAgentRuntimeAdapter } from "./registry";
import type { ArenaEvent } from "@/lib/types/event";

type RunRoundAgentRuntimeInput = {
  agents: AgentRuntimeParticipant[];
  bankrollUsd: number;
  currentPrice: number;
  event: ArenaEvent;
  roundId: string;
};

function clampDecisionSize(sizeUsd: number, bankrollUsd: number) {
  if (!Number.isFinite(sizeUsd)) {
    return bankrollUsd;
  }

  return Math.min(Math.max(sizeUsd, 0), bankrollUsd);
}

function getFallbackExecution(
  agent: AgentRuntimeParticipant,
  decision: AgentRuntimeRawDecision,
): NonNullable<AgentRuntimeRawDecision["execution"]> {
  if (decision.execution) {
    return decision.execution;
  }

  if (agent.brain.provider === "rules") {
    return {
      model: agent.brain.model ?? `${agent.runtimeKey}-rules`,
      provider: "rules",
      status: "rules",
    };
  }

  return {
    model: agent.brain.model,
    provider:
      agent.brain.provider === "openai" || agent.brain.provider === "anthropic"
        ? agent.brain.provider
        : "mock",
    status: "failed-fallback",
  };
}

// 这里在干嘛：
// 让一场 round 里被选中的内部 agents 依次运行 runtime，并产出标准化 action 决策。
// 为什么这么写：
// 用户真实路径是先选 event 和 public agents，然后这些 agents 进入 arena 开打；
// 这个服务把"开打时怎么产生决策"从 createRound 里抽出来，形成独立 runtime 层。
// 升级到 Promise.all 是因为 LLM-backed adapter 现在返回 Promise；
// 规则型 adapter 同步返回值会被 Promise.resolve 自动包装，行为不变。
// 最后返回什么：
// 返回每个 round agent 对应的一条 AgentRuntimeDecision。
export async function runRoundAgentRuntime(
  input: RunRoundAgentRuntimeInput,
): Promise<AgentRuntimeDecision[]> {
  return Promise.all(
    input.agents.map(async (agent) => {
      const adapter = getAgentRuntimeAdapter(agent.runtimeKey);
      const decision = await adapter.decide({
        agent,
        bankrollUsd: input.bankrollUsd,
        currentPrice: input.currentPrice,
        event: input.event,
        opponents: input.agents.filter(
          (candidate) => candidate.identityKey !== agent.identityKey,
        ),
        roundId: input.roundId,
      });
      const execution = getFallbackExecution(agent, decision);

      return {
        brainModel: agent.brain.model,
        brainProvider: agent.brain.provider,
        executionModel: execution.model,
        executionProvider: execution.provider,
        executionStatus: execution.status,
        identityKey: agent.identityKey,
        reason: decision.reason,
        roundAgentId: agent.roundAgentId,
        runtimeKey: agent.runtimeKey,
        side: decision.side,
        sizeUsd: clampDecisionSize(decision.sizeUsd, input.bankrollUsd),
      };
    }),
  );
}
