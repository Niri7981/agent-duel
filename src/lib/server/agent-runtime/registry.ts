import { runContrarianAgent } from "@/lib/runtime/agents/contrarian";
import { runMomentumAgent } from "@/lib/runtime/agents/momentum";
import { runNewsLlmAgent } from "@/lib/runtime/agents/llm-news";
import { runQuantLlmAgent } from "@/lib/runtime/agents/llm-quant";

import type {
  AgentRuntimeAdapter,
  AgentRuntimeDecisionInput,
  AgentRuntimeRawDecision,
} from "./types";

// 这里在干嘛：
// 把 public agent 的 runtimeKey 映射到具体 runtime adapter。
// 为什么这么写：
// runtime 有两个 family：
// - 规则系（momentum / contrarian）—— sync，不依赖外部
// - LLM 系（llm-news / llm-quant）—— async，按 brain 配置选 OpenAI / Anthropic / mock
// adapter 接口用同一个 shape，对外只暴露 .decide()。
// 这样 round 创建逻辑不需要关心 agent 是规则的还是 LLM 的，
// 也不需要关心模型供应商是谁——这就是 “Agent 不是 Model” 的工程落地。

function runMomentumAdapter(
  input: AgentRuntimeDecisionInput,
): AgentRuntimeRawDecision {
  return runMomentumAgent({
    bankrollUsd: input.bankrollUsd,
    currentPrice: input.currentPrice,
    event: input.event,
  });
}

function runContrarianAdapter(
  input: AgentRuntimeDecisionInput,
): AgentRuntimeRawDecision {
  return runContrarianAgent({
    bankrollUsd: input.bankrollUsd,
    currentPrice: input.currentPrice,
    event: input.event,
  });
}

async function runNewsLlmAdapter(
  input: AgentRuntimeDecisionInput,
): Promise<AgentRuntimeRawDecision> {
  return runNewsLlmAgent({
    bankrollUsd: input.bankrollUsd,
    currentPrice: input.currentPrice,
    event: input.event,
    roundId: input.roundId,
  });
}

async function runQuantLlmAdapter(
  input: AgentRuntimeDecisionInput,
): Promise<AgentRuntimeRawDecision> {
  return runQuantLlmAgent({
    bankrollUsd: input.bankrollUsd,
    currentPrice: input.currentPrice,
    event: input.event,
    roundId: input.roundId,
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
  [
    "llm-news",
    {
      decide: runNewsLlmAdapter,
      runtimeKey: "llm-news",
    },
  ],
  [
    "llm-quant",
    {
      decide: runQuantLlmAdapter,
      runtimeKey: "llm-quant",
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
