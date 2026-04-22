import { NextResponse } from "next/server";

import { getAgentPoolEntryById } from "@/lib/server/agents/get-agent-pool";

export async function GET(
  _request: Request,
  context: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await context.params;
  const agent = getAgentPoolEntryById(agentId);

  if (!agent) {
    return NextResponse.json(
      {
        error: "Agent Pool entry not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(agent);
}
