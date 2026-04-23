export type AgentPoolRiskProfile = "low" | "medium" | "high";

//内部的agent标准
export type InternalAgentProfile = {
  id: string;
  identityKey: string;
  runtimeKey: string;
  name: string;
  avatarSeed: string;
  style: string;
  riskProfile: AgentPoolRiskProfile;
  badge: string;
  currentRank: number;
  tagline: string;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
  isActive: boolean;
};

export type GetAgentPoolInput = {
  includeInactive?: boolean;
  limit?: number;
  runtimeKey?: string;
};

export type SeedAgentPoolResult = {
  inserted: number;
  skipped: number;
  updated: number;
};
