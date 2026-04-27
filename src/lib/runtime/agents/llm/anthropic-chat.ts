import type { LlmAdapter, LlmCompletionInput, LlmCompletionOutput } from "./types";

// 这里在干嘛：
// 真实的 Anthropic Messages API adapter。
// 没有 ANTHROPIC_API_KEY 时调用方应当 fallback 到 mock-llm。
// 为什么这么写：
// 和 openai-chat 同构——上层 agent runtime 只关心标准 LlmAdapter 接口；
// 这里负责把 prompt 包成 Anthropic request 并解析回标准 shape。
// 最后返回什么：
// 返回一个实现 LlmAdapter 的对象，complete() 命中 Anthropic 拿真实推理结果。

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_VERSION = "2023-06-01";

type AnthropicAdapterConfig = {
  apiKey: string;
  model: string;
};

type AnthropicContentBlock = {
  type?: string;
  text?: string;
};

type AnthropicMessagesResponse = {
  content?: AnthropicContentBlock[];
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

export function buildAnthropicAdapter(
  config: AnthropicAdapterConfig,
): LlmAdapter {
  return {
    provider: "anthropic",
    model: config.model,
    async complete(input: LlmCompletionInput): Promise<LlmCompletionOutput> {
      const response = await fetch(ANTHROPIC_MESSAGES_URL, {
        body: JSON.stringify({
          max_tokens: 512,
          messages: [{ content: input.userPrompt, role: "user" }],
          model: config.model,
          system: input.systemPrompt,
          temperature: 0.4,
        }),
        headers: {
          "anthropic-version": ANTHROPIC_API_VERSION,
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Anthropic adapter failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as AnthropicMessagesResponse;
      const rawText =
        data.content
          ?.map((block) => (block.type === "text" ? block.text ?? "" : ""))
          .join("") ?? "{}";
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
