export type RoundAction = {
  id: string;
  agentId: string;
  agentName: string;
  side: "yes" | "no";
  sizeUsd: number;
  at: string;
  reason: string;
};
