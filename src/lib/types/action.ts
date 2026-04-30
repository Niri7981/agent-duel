export type RoundActionRuntimeSnapshot = {
  brainModel: string | null;
  brainProvider: "anthropic" | "mock" | "openai" | "rules" | null;
  executionModel: string | null;
  executionProvider: "anthropic" | "mock" | "openai" | "rules" | null;
  executionStatus: "completed" | "failed-fallback" | "mocked" | "rules" | null;
  runtimeKey: string | null;
};

export type RoundAction = {
  id: string;
  agentId: string;
  agentName: string;
  side: "yes" | "no";
  sizeUsd: number;
  at: string;
  reason: string;
  runtime?: RoundActionRuntimeSnapshot;
};
