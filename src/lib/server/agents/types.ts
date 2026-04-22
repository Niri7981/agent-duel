export type AgentPoolRiskProfile = "low" | "medium" | "high";

export type AgentPoolEntry = {
  id: string;
  runtimeKey: string;
  name: string;
  style: string;
  riskProfile: AgentPoolRiskProfile;
  badge: string;
  currentRank: number;
  avatarSeed: string;
  tagline: string;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
};

export type GetAgentPoolInput = {
  limit?: number;
  runtimeKey?: string;
};
