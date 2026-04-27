import type {
  AgentRuntimeDecision,
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

// 这里在干嘛：
// 让一场 round 里被选中的内部 agents 依次运行 runtime，并产出标准化 action 决策。
// 为什么这么写：
// 用户真实路径是先选 event 和 public agents，然后这些 agents 进入 arena 开打；
// 这个服务把“开打时怎么产生决策”从 createRound 里抽出来，形成独立 runtime 层。
// 最后返回什么：
// 返回每个 round agent 对应的一条 AgentRuntimeDecision。
export function runRoundAgentRuntime(
  input: RunRoundAgentRuntimeInput,
): AgentRuntimeDecision[] {
  return input.agents.map((agent) => {
    const adapter = getAgentRuntimeAdapter(agent.runtimeKey);
    const decision = adapter.decide({
      agent,
      bankrollUsd: input.bankrollUsd,
      currentPrice: input.currentPrice,
      event: input.event,
      opponents: input.agents.filter(
        (candidate) => candidate.identityKey !== agent.identityKey,
      ),
      roundId: input.roundId,
    });

    return {
      identityKey: agent.identityKey,
      reason: decision.reason,
      roundAgentId: agent.roundAgentId,
      runtimeKey: agent.runtimeKey,
      side: decision.side,
      sizeUsd: clampDecisionSize(decision.sizeUsd, input.bankrollUsd),
    };
  });
}
