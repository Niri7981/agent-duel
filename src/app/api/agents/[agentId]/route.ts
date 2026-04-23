import { NextResponse } from "next/server";

import { getAgentProfile } from "@/lib/server/agents/get-agent-profile";

export async function GET(
  _request: Request,
  context: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await context.params;
  const profile = await getAgentProfile(agentId);

  if (!profile) {
    return NextResponse.json(
      {
        error: "Agent Pool entry not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(profile);
}
