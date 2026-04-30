import type { AgentDecision, AgentDecisionInput } from "@/lib/runtime/agents/types";
import { runLlmAgent, type BrainConfig } from "./llm";

const CONTRARIAN_PERSONA = {
  decisionPolicy:
    "Fade crowded consensus. Prefer NO when the market looks overconfident above fair value; prefer YES when pessimism is exhausted. Size patiently and explain the crowd error.",
  name: "Contrarian Agent",
  styleSummary:
    "Crowd-fading arena competitor that looks for consensus excess, mispriced sentiment, and resilient counter-positioning.",
};

export function runContrarianAgent(
  input: AgentDecisionInput,
): AgentDecision {
  const side = input.currentPrice >= 0.5 ? "no" : "yes";
  const sizeUsd = Math.min(3, input.bankrollUsd * 0.3);

  return {
    execution: {
      model: "rules-contrarian-v1",
      provider: "rules",
      status: "rules",
    },
    reason: "Takes the opposite side when consensus looks crowded.",
    side,
    sizeUsd,
    trace: [
      {
        detail: `Current price ${input.currentPrice.toFixed(2)} used as the crowd consensus signal.`,
        phase: "context",
        title: "Consensus Signal Read",
      },
      {
        detail: "Contrarian policy fades crowded direction and limits exposure to 30% of bankroll.",
        phase: "policy",
        title: "Crowd Fade Applied",
      },
      {
        detail: `Committed ${side.toUpperCase()} with ${sizeUsd.toFixed(2)} USDC exposure.`,
        phase: "decision",
        title: "Arena Action Submitted",
      },
    ],
  };
}

// 这里在干嘛：
// Contrarian 的 LLM-backed runtime persona。
// 为什么这么写：
// 让公开 agent 的策略风格和底层 brain 解耦；
// Claude/GPT 只是大脑，Contrarian 才是进入 arena 的身份。
// 最后返回什么：
// 一条标准 AgentDecision，包含执行 provider/model/status 快照。
export async function runContrarianLlmAgent(
  input: AgentDecisionInput & {
    brain: BrainConfig;
    roundId: string;
  },
): Promise<AgentDecision> {
  return runLlmAgent({
    brain: input.brain,
    context: {
      agentName: CONTRARIAN_PERSONA.name,
      agentStyle: CONTRARIAN_PERSONA.styleSummary,
      bankrollUsd: input.bankrollUsd,
      currentPrice: input.currentPrice,
      question: input.event.question,
      resolutionSource: input.event.resolutionSource,
      roundId: input.roundId,
    },
    persona: CONTRARIAN_PERSONA,
  });
}
