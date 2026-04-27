import { runContrarianAgent } from "@/lib/runtime/agents/contrarian";
import { runMomentumAgent } from "@/lib/runtime/agents/momentum";

import type { AgentRuntimeAdapter, AgentRuntimeDecisionInput } from "./types";

function runMomentumAdapter(input: AgentRuntimeDecisionInput) {
  return runMomentumAgent({
    bankrollUsd: input.bankrollUsd,
    currentPrice: input.currentPrice,
    event: input.event,
  });
}

function runContrarianAdapter(input: AgentRuntimeDecisionInput) {
  return runContrarianAgent({
    bankrollUsd: input.bankrollUsd,
    currentPrice: input.currentPrice,
    event: input.event,
  });
}

const AGENT_RUNTIME_REGISTRY = new Map<string, AgentRuntimeAdapter>([
  [
    "momentum",
    {
      decide: runMomentumAdapter,
      runtimeKey: "momentum",
    },
  ],
  [
    "contrarian",
    {
      decide: runContrarianAdapter,
      runtimeKey: "contrarian",
    },
  ],
]);

// 这里在干嘛：
// 根据 public agent profile 上的 runtimeKey，找到内部 runtime adapter。
// 为什么这么写：
// battle 层关心的是公开 identity，runtime 层才关心 runtimeKey；
// 把 registry 集中在这里，可以避免 createRound 直接判断不同策略。
// 最后返回什么：
// 返回匹配的 AgentRuntimeAdapter；找不到时抛错，让 round creation 明确失败。
export function getAgentRuntimeAdapter(runtimeKey: string) {
  const adapter = AGENT_RUNTIME_REGISTRY.get(runtimeKey);

  if (!adapter) {
    throw new Error(`No agent runtime adapter registered for ${runtimeKey}.`);
  }

  return adapter;
}
