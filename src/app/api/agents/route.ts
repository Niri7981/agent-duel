import { NextResponse } from "next/server";

import { getAgentPool } from "@/lib/server/agents/get-agent-pool";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runtimeKey = searchParams.get("runtimeKey");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  // Agent Pool 返回的是公开参赛者身份，不是底层模型实现细节。
  return NextResponse.json(
    getAgentPool({
      limit: Number.isFinite(limit) ? limit : undefined,
      runtimeKey: runtimeKey ?? undefined,
    }),
  );
}
