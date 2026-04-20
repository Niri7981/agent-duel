import { NextResponse } from "next/server";

import { getDemoRoundState } from "@/lib/engine/run-round";

export async function GET() {
  return NextResponse.json(getDemoRoundState());
}
