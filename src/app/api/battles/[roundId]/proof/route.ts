import { NextResponse } from "next/server";

import { getBattleProof } from "@/lib/server/battles/get-battle-proof";

export async function GET(
  _request: Request,
  context: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await context.params;
  const proof = await getBattleProof(roundId);

  if (!proof) {
    return NextResponse.json(
      {
        error: "Battle proof not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(proof);
}
