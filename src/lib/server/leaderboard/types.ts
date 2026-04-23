export type LeaderboardEntry = {
  id: string;
  identityKey: string;
  runtimeKey: string;
  name: string;
  avatarSeed: string;
  style: string;
  riskProfile: "low" | "medium" | "high";
  badge: string;
  tagline: string;
  currentRank: number;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
  matchesPlayed: number;
  winRate: number | null;
  isActive: boolean;
};

