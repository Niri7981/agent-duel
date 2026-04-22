import { NextResponse } from "next/server";
import { z } from "zod";

import { createRound } from "@/lib/server/rounds/create-round";
import { getLatestRound } from "@/lib/server/rounds/get-latest-round";
import { mapRoundToState } from "@/lib/server/rounds/map-round-state";

const createRoundPayloadSchema = z.object({
  agentIds: z.array(z.string()).min(2).max(2).optional(),
  bankrollPerAgent: z.number().positive().optional(),
  durationSeconds: z.number().int().positive().optional(),
  eventId: z.string().min(1).optional(),
  startsAt: z.string().datetime().optional(),
});

export async function GET() {
  const round = await getLatestRound();

  if (!round) {
    return NextResponse.json(
      {
        error: "No duel round found.",
      },
      { status: 404 },
    );
  }

  // GET 只负责把最新一场 duel 读出来并映射成前端状态。
  return NextResponse.json(mapRoundToState(round));
}

export async function POST(request: Request) {
  try {
    const rawPayload = (await request.json().catch(() => ({}))) as unknown;
    const payload = createRoundPayloadSchema.parse(rawPayload);

    // POST 负责创建一场全新的 duel，并立刻返回可渲染的 round state。
    const round = await createRound({
      agentIds: payload.agentIds,
      bankrollPerAgent: payload.bankrollPerAgent,
      durationSeconds: payload.durationSeconds,
      eventId: payload.eventId,
      startsAt: payload.startsAt ? new Date(payload.startsAt) : undefined,
    });

    return NextResponse.json(mapRoundToState(round), { status: 201 });
  } catch (error) {
    console.error("Failed to create round", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid round creation payload.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create duel round.",
      },
      { status: 500 },
    );
  }
}
