import { NextResponse } from "next/server";

import { getBattleAnchor } from "@/lib/server/battles/get-battle-anchor";
import { getBattleProof } from "@/lib/server/battles/get-battle-proof";

export async function GET(
  _request: Request,
  context: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await context.params;
  const [proof, anchor] = await Promise.all([
    getBattleProof(roundId),
    getBattleAnchor(roundId),
  ]);

  if (!proof) {
    return NextResponse.json(
      {
        error: "Battle proof not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    payload: proof,
    record: anchor ?? {
      anchoredAt: null,
      explorerUrl: null,
      network: "localnet" as const,
      onchainProofAddress: null,
      onchainSignature: null,
      proofHash: null,
      proofHashEncoding: "canonical-json-v1",
      proofVersion: proof.proofVersion,
      slot: null,
      verificationError: null,
      verificationStatus: "pending" as const,
      verified: false,
    },
  });
}
