import type { PublicKey } from "@solana/web3.js";

export type RecordBattleProofWinningSide = "none" | "yes" | "no";

export type RecordBattleProofInput = {
  authority: PublicKey;
  proofHash: string;
  proofVersion: number;
  roundId: string;
  settledAt: Date | number;
  winnerIdentityKey: string | null;
  winningSide: RecordBattleProofWinningSide;
};

export type BattleProofPda = {
  bump: number;
  proofAddress: PublicKey;
  roundIdSeed: Uint8Array;
};

export type DecodedBattleProofAnchor = {
  authority: PublicKey;
  proofHash: string;
  roundIdSeed: Uint8Array;
  roundId: string;
  winnerIdentityKey: string | null;
  settledAtUnix: number;
  proofVersion: number;
  winningSide: RecordBattleProofWinningSide;
  roundIdLength: number;
  winnerIdentityKeyLength: number;
  bump: number;
};
