import type { LlmAdapter, LlmCompletionInput, LlmCompletionOutput } from "./types";

// 这里在干嘛：
// 一个 deterministic 的本地 LLM 替身。
// 同一组输入永远产出同样的“假 LLM 回答”，方便 demo 复现和测试。
// 为什么这么写：
// hackathon 阶段不一定每个评委本地都有 OpenAI / Anthropic key，
// 但我们必须证明 Agent Runtime 是 model-agnostic 的：
// 真 LLM adapter 和 mock adapter 走的是同一接口、同一 prompt 协议。
// 这样换底层大脑只是换 adapter，不需要改 Agent runtime 一行。
// 最后返回什么：
// 返回一个实现 LlmAdapter 的对象，complete() 给出稳定 JSON 风格的 output。

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pickSide(seed: string): "yes" | "no" {
  return hashSeed(`${seed}:side`) % 2 === 0 ? "yes" : "no";
}

function pickSize(seed: string, bankrollUsd: number) {
  const ratio = 0.18 + ((hashSeed(`${seed}:size`) % 30) / 100);
  return Number((bankrollUsd * ratio).toFixed(2));
}

function buildReason(seed: string, side: "yes" | "no") {
  const flavors = [
    "live signal cluster strengthens",
    "narrative inflection appears",
    "consensus pricing looks lazy",
    "tape acceleration confirms",
    "venue divergence opens edge",
  ];
  const flavor = flavors[hashSeed(`${seed}:reason`) % flavors.length];

  return `Leans ${side.toUpperCase()} — ${flavor}.`;
}

type MockLlmConfig = {
  // 让上层标识它“当前在替哪个 model 模拟”，
  // 这样卡片上仍然能展示 “Brain: gpt-5 (mocked)”。
  emulatedProvider: "openai" | "anthropic";
  emulatedModel: string;
};

export function buildMockLlmAdapter(config: MockLlmConfig): LlmAdapter {
  return {
    provider: "mock",
    model: `mock-${config.emulatedProvider}-${config.emulatedModel}`,
    async complete(input: LlmCompletionInput): Promise<LlmCompletionOutput> {
      const side = pickSide(input.seed);
      const sizeUsd = pickSize(input.seed, 10);
      const reason = buildReason(input.seed, side);

      return {
        rawText: JSON.stringify({ reason, side, sizeUsd }),
        reason,
        side,
        sizeUsd,
      };
    },
  };
}
