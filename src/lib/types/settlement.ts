export type SettledAgentReputation = {
  identityKey: string;
  name: string;
  badge: string;
  currentRank: number;
  currentStreak: number;
  bestStreak: number;
  totalWins: number;
  totalLosses: number;
};

export type RoundSettlement = {
  winnerAgentId: string;
  winnerName: string;
  finalBalance: number;
  pnlUsd: number;
  status: "pending" | "settled";
  winnerReputation?: SettledAgentReputation | null;
};
