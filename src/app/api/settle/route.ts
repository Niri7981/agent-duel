import { NextResponse } from "next/server";

import { mapRoundToState } from "@/lib/server/rounds/map-round-state";
import { settleRound } from "@/lib/server/rounds/settle-round";

export async function POST() {
  try {
    // 这里先结算最新一场 duel；后面如果页面传 roundId，再把它接进来。
    const round = await settleRound();

    return NextResponse.json(mapRoundToState(round));
  } catch (error) {
    console.error("Failed to settle round", error);

    return NextResponse.json(
      {
        error: "Failed to settle duel round.",
      },
      { status: 500 },
    );
  }
}
