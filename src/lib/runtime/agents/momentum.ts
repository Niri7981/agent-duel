import type { AgentDecision, AgentDecisionInput } from "@/lib/runtime/agents/types";
import { runLlmAgent, type BrainConfig } from "./llm";

const MOMENTUM_PERSONA = {
  decisionPolicy:
    "Ride confirmed directional strength. Prefer YES when price and narrative are accelerating; prefer NO when momentum is breaking down. Press only with controlled sizing.",
  name: "Momentum Agent",
  styleSummary:
    "Trend-following arena competitor that seeks acceleration, breakout pressure, and conviction build-up.",
};

export function runMomentumAgent(
  input: AgentDecisionInput,
): AgentDecision {
  return {
    execution: {
      model: "rules-momentum-v1",
      provider: "rules",
      status: "rules",
    },
    side: input.currentPrice >= 0.5 ? "yes" : "no",
    sizeUsd: Math.min(4, input.bankrollUsd * 0.4),
    reason: "Follows the current market direction with controlled size.",
  };
}

// 这里在干嘛：
// Momentum 的 LLM-backed runtime persona。
// 为什么这么写：
// 公开 agent 身份不等于底层模型；Momentum 仍然是 Momentum，
// 只是把“趋势跟随”的决策风格交给当前 brain 执行。
// 最后返回什么：
// 一条标准 AgentDecision，包含执行 provider/model/status 快照。
export async function runMomentumLlmAgent(
  input: AgentDecisionInput & {
    brain: BrainConfig;
    roundId: string;
  },
): Promise<AgentDecision> {
  return runLlmAgent({
    brain: input.brain,
    context: {
      agentName: MOMENTUM_PERSONA.name,
      agentStyle: MOMENTUM_PERSONA.styleSummary,
      bankrollUsd: input.bankrollUsd,
      currentPrice: input.currentPrice,
      question: input.event.question,
      resolutionSource: input.event.resolutionSource,
      roundId: input.roundId,
    },
    persona: MOMENTUM_PERSONA,
  });
}
