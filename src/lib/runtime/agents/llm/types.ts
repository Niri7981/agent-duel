import type {
  AgentDecision,
  AgentDecisionExecution,
} from "@/lib/runtime/agents/types";

// LLM adapter 是 Agent Runtime 的下一层。
// Agent 提交一段标准化 prompt 给 LLM，LLM 回一段 JSON，
// 解析出一个标准 AgentDecision。
//
// 我们故意把 LLM 调用单独抽出来，
// 让上层的 Agent runtime（llm-news / llm-quant 等）只关心策略风格，
// 不关心底层模型是 OpenAI 还是 Anthropic 还是 mock。
export type LlmCompletionInput = {
  systemPrompt: string;
  userPrompt: string;
  // 同一 round + 同一 agent 想要 deterministic 输出时使用。
  // mock LLM 用这个生成稳定假回答。
  seed: string;
};

export type LlmCompletionOutput = {
  side: "yes" | "no";
  sizeUsd: number;
  reason: string;
  rawText: string;
};

export type LlmAdapter = {
  provider: "openai" | "anthropic" | "mock";
  model: string;
  complete(input: LlmCompletionInput): Promise<LlmCompletionOutput>;
};

export type LlmDecisionContext = {
  bankrollUsd: number;
  currentPrice: number;
  marketSymbol?: string;
  question: string;
  resolutionSource: string;
  roundId: string;
  agentName: string;
  agentStyle: string;
};

// 上层把 LLM 输出 clamp 到合理范围后形成标准 AgentDecision。
export type LlmDecision = AgentDecision & {
  brainProvider: LlmAdapter["provider"];
  brainModel: string;
  execution: AgentDecisionExecution;
};
