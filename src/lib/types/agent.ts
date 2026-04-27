export type AgentBrainProvider = "openai" | "anthropic" | "rules" | "mock";

export type AgentBrain = {
  provider: AgentBrainProvider;
  model: string;
  swappedAt: string | null;
};

export type AgentSummary = {
  id: string;
  name: string;
  style: string;
  riskProfile: "low" | "medium" | "high";
  brain?: AgentBrain | null;
};
