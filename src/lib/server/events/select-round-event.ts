import type { ArenaEvent } from "@/lib/types/event";

import { buildDemoMarket } from "@/lib/server/rounds/demo-market";

import {
  getEventPoolItemById,
  getReadyEventPool,
  type InternalEventPoolItem,
} from "./get-event-pool";

export type SelectedRoundEvent = {
  poolItem: InternalEventPoolItem;
  market: ReturnType<typeof buildDemoMarket>;
  eventInput: Omit<ArenaEvent, "id">;
};

export type SelectRoundEventInput = {
  durationSeconds?: number;
  eventId?: string;
  startsAt?: Date;
};

// Round 层不应该再自己发明事件。
// 它只应该从内部 Event Pool 里挑一条事件，然后展开成 battle 需要的市场快照。
export async function selectRoundEvent(
  input: SelectRoundEventInput = {},
): Promise<SelectedRoundEvent> {
  const poolItem =
    (input.eventId ? await getEventPoolItemById(input.eventId) : null) ??
    (await getReadyEventPool(1))[0];

  if (!poolItem) {
    throw new Error("Event Pool is empty.");
  }

  const market = buildDemoMarket({
    durationSeconds: input.durationSeconds ?? poolItem.durationSeconds,
    marketSymbol: poolItem.marketSymbol,
    startsAt: input.startsAt,
  });

  return {
    eventInput: {
      outcome: "pending",
      question: poolItem.question,
      resolutionSource: poolItem.resolutionSource,
    },
    market,
    poolItem,
  };
}
