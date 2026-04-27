import type { AgentProfile } from "@/generated/prisma/client";

export type ReputationResult = "win" | "loss" | "draw";

export type ReputationProfileSnapshot = Pick<
  AgentProfile,
  | "identityKey"
  | "name"
  | "currentRank"
  | "previousRank"
  | "totalWins"
  | "totalLosses"
  | "currentStreak"
  | "bestStreak"
>;

export type ReputationEffect = {
  identityKey: string;
  name: string;
  result: ReputationResult;
  rankBefore: number;
  rankAfter: number;
  rankDelta: number;
  winsBefore: number;
  winsAfter: number;
  lossesBefore: number;
  lossesAfter: number;
  streakBefore: number;
  streakAfter: number;
  bestStreakBefore: number;
  bestStreakAfter: number;
};

export type BattleReputationUpdateResult = {
  beforeProfiles: ReputationProfileSnapshot[];
  afterProfiles: ReputationProfileSnapshot[];
};
