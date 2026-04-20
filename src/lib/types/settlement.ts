export type RoundSettlement = {
  winnerAgentId: string;
  winnerName: string;
  finalBalance: number;
  pnlUsd: number;
  status: "pending" | "settled";
};
