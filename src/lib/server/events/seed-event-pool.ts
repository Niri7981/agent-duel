import { prisma } from "@/lib/db/prisma";

import { normalizePolymarketEventWithReason } from "./normalize-event";
import { fetchPolymarketEventCandidates, type PolymarketRawEventCandidate } from "./sources/polymarket";
import type { InternalEventPoolItem, SeedEventPoolResult } from "./types";

type SeedEventPoolInput = {
  candidates?: PolymarketRawEventCandidate[];
  limit?: number;
};

// seed-event-pool.ts 负责把 normalized events 写进 arena 自己的事件池。
// 这里会去重、过滤无效候选，并把外部 source 的变化 upsert 到内部存储层。
export async function seedEventPool(
  input: SeedEventPoolInput = {},
): Promise<SeedEventPoolResult> {
  const rawCandidates =
    input.candidates ?? (await fetchPolymarketEventCandidates({ limit: input.limit }));

  const dedupeKeys = new Set<string>();
  const validEvents: Array<Omit<InternalEventPoolItem, "id">> = [];
  const invalidBreakdown: Record<string, number> = {};
  let inserted = 0;
  let invalid = 0;
  let skipped = 0;
  let updated = 0;

  for (const candidate of rawCandidates) {
    const normalized = normalizePolymarketEventWithReason(candidate);

    if (!normalized.ok) {
      invalid += 1;
      invalidBreakdown[normalized.reason] =
        (invalidBreakdown[normalized.reason] ?? 0) + 1;
      continue;
    }

    const normalizedEvent = normalized.value;

    const dedupeKey = `${normalizedEvent.sourceKey}:${normalizedEvent.externalEventId}`;

    if (dedupeKeys.has(dedupeKey)) {
      skipped += 1;
      continue;
    }

    dedupeKeys.add(dedupeKey);
    validEvents.push(normalizedEvent);
  }

  await prisma.$transaction(async (tx) => {
    // 每次 sync 都把 Polymarket 当前快照重建成 arena 自己的 playable pool。
    // 这样页面展示的是“这一次同步后仍然可用的事件”，而不是历史残留记录。
    await tx.eventPoolItem.updateMany({
      data: {
        playable: false,
        status: "archived",
      },
      where: {
        sourceKey: "polymarket",
      },
    });

    for (const normalized of validEvents) {
      const existing = await tx.eventPoolItem.findUnique({
        where: {
          sourceKey_externalEventId: {
            externalEventId: normalized.externalEventId,
            sourceKey: normalized.sourceKey,
          },
        },
      });

      await tx.eventPoolItem.upsert({
        create: normalized,
        update: normalized,
        where: {
          sourceKey_externalEventId: {
            externalEventId: normalized.externalEventId,
            sourceKey: normalized.sourceKey,
          },
        },
      });

      if (existing) {
        updated += 1;
      } else {
        inserted += 1;
      }
    }
  });

  return {
    inserted,
    invalid,
    invalidBreakdown,
    skipped,
    updated,
  };
}
