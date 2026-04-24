import { NextResponse } from "next/server";

import { getBattleRecord } from "@/lib/server/battles/get-battle-record";

export async function GET(
  _request: Request,
  context: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await context.params;
  const battle = await getBattleRecord(roundId);

  if (!battle) {
    return NextResponse.json(
      {
        error: "Battle record not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(battle);
}
