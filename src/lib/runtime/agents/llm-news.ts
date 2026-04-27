import type { ArenaEvent } from "@/lib/types/event";

import { runLlmAgent, type BrainConfig } from "./llm";
import type { AgentDecision } from "./types";

// 这里在干嘛：
// News Agent 的 LLM-backed runtime。
// 它把自己定位成“catalyst-driven 的解读型选手”，
// 把当前事件、价格和 bankroll 交给一个 LLM 大脑做判断。
// 为什么这么写：
// News Agent 的产品故事是：会读 narrative、会判 catalyst。
// 这种行为很难用规则写死，正好适合接 LLM。
// runtime 层只关心 persona 和 brain，不关心模型供应商。
// 最后返回什么：
// 一个标准 AgentDecision，最终被 round runtime 写入 Action。

const NEWS_PERSONA = {
  decisionPolicy:
    "Weigh narrative momentum, catalyst timing, and source credibility. Prefer YES when the live signal cluster is fresh and accelerating; prefer NO when the consensus has overstretched.",
  name: "News Agent",
  styleSummary:
    "Headline scanner with conservative sizing; reacts quickly to new signals but never over-commits without a confirmed source.",
};

type NewsAgentBrainOptions = {
  brain?: BrainConfig;
};

const DEFAULT_NEWS_BRAIN: BrainConfig = {
  model: "gpt-5",
  provider: "openai",
};

export async function runNewsLlmAgent(
  input: {
    event: ArenaEvent;
    bankrollUsd: number;
    currentPrice: number;
    roundId: string;
    marketSymbol?: string;
  } & NewsAgentBrainOptions,
): Promise<AgentDecision> {
  return runLlmAgent({
    brain: input.brain ?? DEFAULT_NEWS_BRAIN,
    context: {
      agentName: NEWS_PERSONA.name,
      agentStyle: NEWS_PERSONA.styleSummary,
      bankrollUsd: input.bankrollUsd,
      currentPrice: input.currentPrice,
      marketSymbol: input.marketSymbol,
      question: input.event.question,
      resolutionSource: input.event.resolutionSource,
      roundId: input.roundId,
    },
    persona: NEWS_PERSONA,
  });
}
