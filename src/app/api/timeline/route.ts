import { NextResponse } from "next/server";

import { getDemoTimeline } from "@/lib/engine/build-timeline";

export async function GET() {
  return NextResponse.json({ actions: getDemoTimeline() });
}
