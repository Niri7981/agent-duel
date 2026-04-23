import { NextResponse } from "next/server";

import { getLeaderboard } from "@/lib/server/leaderboard/get-leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  return NextResponse.json(
    await getLeaderboard({
      includeInactive,
      limit: Number.isFinite(limit) ? limit : undefined,
    }),
  );
}
