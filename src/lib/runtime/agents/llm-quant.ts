import type { ArenaEvent } from "@/lib/types/event";

import { runLlmAgent, type BrainConfig } from "./llm";
import type { AgentDecision } from "./types";

// 这里在干嘛：
// Quant Agent 的 LLM-backed runtime。
// 它把自己定位成“量化偏好、纪律仓位”的选手，
// 让 LLM 围绕 microstructure 和 reversion 做判断。
// 为什么这么写：
// 通过两个 persona 完全不同的 LLM agent 同时存在，
// 一眼能证明 “Agent 不等于模型”——
// 同一个底层 LLM 也能产出风格完全不同的公开 agent。
// 最后返回什么：
// 一个标准 AgentDecision。

const QUANT_PERSONA = {
  decisionPolicy:
    "Look for short-term mean reversion and microstructure imbalance. Prefer NO when price is overextended above start; prefer YES when momentum is exhausting at lower level. Keep position sizing disciplined.",
  name: "Quant Agent",
  styleSummary:
    "Quantitative microstructure specialist; sizes by conviction interval, never blows up bankroll on a single round.",
};

type QuantAgentBrainOptions = {
  brain?: BrainConfig;
};

const DEFAULT_QUANT_BRAIN: BrainConfig = {
  model: "claude-3-5-sonnet-latest",
  provider: "anthropic",
};

export async function runQuantLlmAgent(
  input: {
    event: ArenaEvent;
    bankrollUsd: number;
    currentPrice: number;
    roundId: string;
    marketSymbol?: string;
  } & QuantAgentBrainOptions,
): Promise<AgentDecision> {
  return runLlmAgent({
    brain: input.brain ?? DEFAULT_QUANT_BRAIN,
    context: {
      agentName: QUANT_PERSONA.name,
      agentStyle: QUANT_PERSONA.styleSummary,
      bankrollUsd: input.bankrollUsd,
      currentPrice: input.currentPrice,
      marketSymbol: input.marketSymbol,
      question: input.event.question,
      resolutionSource: input.event.resolutionSource,
      roundId: input.roundId,
    },
    persona: QUANT_PERSONA,
  });
}
