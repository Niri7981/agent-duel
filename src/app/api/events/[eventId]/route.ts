import { NextResponse } from "next/server";

import { getEventPoolItemById } from "@/lib/server/events/get-event-pool";

export async function GET(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const event = await getEventPoolItemById(eventId);

  if (!event) {
    return NextResponse.json(
      {
        error: "Event Pool item not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(event);
}
