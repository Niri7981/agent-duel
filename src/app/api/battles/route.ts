import { NextResponse } from "next/server";

import { getBattleHistory } from "@/lib/server/battles/get-battle-history";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentIdentityKey = searchParams.get("agentIdentityKey");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "live" || statusParam === "settled"
      ? statusParam
      : undefined;

  return NextResponse.json(
    await getBattleHistory({
      agentIdentityKey: agentIdentityKey ?? undefined,
      limit: Number.isFinite(limit) ? limit : undefined,
      status,
    }),
  );
}
