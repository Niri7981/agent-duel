import type { LlmAdapter, LlmCompletionInput, LlmCompletionOutput } from "./types";

// 这里在干嘛：
// 真实的 OpenAI Chat Completions adapter。
// 没有 OPENAI_API_KEY 时调用方应当 fallback 到 mock-llm。
// 为什么这么写：
// 我们坚持 Agent Runtime model-agnostic：
// 上层 agent runtime 只调 adapter.complete()，
// 这里负责把 prompt 翻译成 OpenAI request，再把 response 解析成统一 shape。
// 最后返回什么：
// 返回一个实现 LlmAdapter 的对象，complete() 命中 OpenAI 拿真实推理结果。

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

type OpenAiAdapterConfig = {
  apiKey: string;
  model: string;
};

type OpenAiChoiceMessage = {
  content?: string | null;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: OpenAiChoiceMessage;
  }>;
};

function clampSizeUsd(rawSize: unknown) {
  const parsed = Number(rawSize);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 1;
  }

  return Math.min(Math.max(parsed, 0), 100);
}

function parseDecisionJson(text: string): {
  side: "yes" | "no";
  sizeUsd: number;
  reason: string;
} {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const jsonSlice =
    jsonStart >= 0 && jsonEnd > jsonStart
      ? text.slice(jsonStart, jsonEnd + 1)
      : text;

  let parsed: Record<string, unknown> = {};

  try {
    parsed = JSON.parse(jsonSlice) as Record<string, unknown>;
  } catch {
    parsed = {};
  }

  const side = parsed.side === "no" ? "no" : "yes";
  const sizeUsd = clampSizeUsd(parsed.sizeUsd);
  const reason =
    typeof parsed.reason === "string" && parsed.reason.length > 0
      ? parsed.reason
      : "Reason missing in LLM output.";

  return { reason, side, sizeUsd };
}

export function buildOpenAiAdapter(config: OpenAiAdapterConfig): LlmAdapter {
  return {
    provider: "openai",
    model: config.model,
    async complete(input: LlmCompletionInput): Promise<LlmCompletionOutput> {
      const response = await fetch(OPENAI_CHAT_URL, {
        body: JSON.stringify({
          messages: [
            { content: input.systemPrompt, role: "system" },
            { content: input.userPrompt, role: "user" },
          ],
          model: config.model,
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI adapter failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as OpenAiChatResponse;
      const rawText = data.choices?.[0]?.message?.content ?? "{}";
      const decision = parseDecisionJson(rawText);

      return {
        rawText,
        reason: decision.reason,
        side: decision.side,
        sizeUsd: decision.sizeUsd,
      };
    },
  };
}
