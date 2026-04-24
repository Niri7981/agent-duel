export type BattleOutcome = "yes" | "no" | "pending";
export type BattleStatus = "live" | "settled";
export type BattleParticipantSide = "yes" | "no" | null;

export type BattleParticipantRecord = {
  agentId: string;
  name: string;
  style: string;
  riskProfile: "low" | "medium" | "high";
  side: BattleParticipantSide;
  sizeUsd: number | null;
  reason: string | null;
  startingBalance: number;
  finalBalance: number;
  pnlUsd: number;
  isWinner: boolean;
};

export type BattleRecord = {
  roundId: string;
  marketSymbol: string;
  roundStatus: BattleStatus;
  question: string;
  resolutionSource: string;
  outcome: BattleOutcome;
  createdAt: string;
  settledAt: string | null;
  winningAgentId: string | null;
  winningAgentName: string | null;
  winningSide: "yes" | "no" | null;
  finalBalance: number | null;
  pnlUsd: number | null;
  participants: BattleParticipantRecord[];
};

export type BattleProofParticipant = {
  identityKey: string;
  name: string;
  side: BattleParticipantSide;
  sizeUsd: number | null;
  reasonSummary: string | null;
  startingBalance: number;
  finalBalance: number;
  pnlUsd: number;
};

export type BattleProofReputationEffect = {
  identityKey: string;
  name: string;
  result: "win" | "loss" | "draw";
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

export type BattleProofPayload = {
  proofVersion: 1;
  roundId: string;
  createdAt: string;
  settledAt: string | null;
  eventId: string | null;
  marketSymbol: string;
  question: string;
  resolutionSource: string;
  outcome: BattleOutcome;
  participants: BattleProofParticipant[];
  winnerIdentityKey: string | null;
  winnerName: string | null;
  winningSide: "yes" | "no" | null;
  finalBalance: number | null;
  pnlUsd: number | null;
  reputationEffects: BattleProofReputationEffect[];
};
