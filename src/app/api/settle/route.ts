import { NextResponse } from "next/server";

import { getDemoRoundState } from "@/lib/engine/run-round";
import { buildSettlementPreview } from "@/lib/engine/settle-round";

export async function POST() {
  const round = getDemoRoundState();

  return NextResponse.json({
    settlement: buildSettlementPreview(round),
  });
}
