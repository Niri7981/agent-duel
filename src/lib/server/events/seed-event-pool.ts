import { prisma } from "@/lib/db/prisma";

import { normalizePolymarketEvent } from "./normalize-event";
import { fetchPolymarketEventCandidates, type PolymarketRawEventCandidate } from "./sources/polymarket";
import type { SeedEventPoolResult } from "./types";

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
  let inserted = 0;
  let invalid = 0;
  let skipped = 0;
  let updated = 0;

  for (const candidate of rawCandidates) {
    const normalized = normalizePolymarketEvent(candidate);

    if (!normalized) {
      invalid += 1;
      continue;
    }

    const dedupeKey = `${normalized.sourceKey}:${normalized.externalEventId}`;

    if (dedupeKeys.has(dedupeKey)) {
      skipped += 1;
      continue;
    }

    dedupeKeys.add(dedupeKey);

    const existing = await prisma.eventPoolItem.findUnique({
      where: {
        sourceKey_externalEventId: {
          externalEventId: normalized.externalEventId,
          sourceKey: normalized.sourceKey,
        },
      },
    });

    await prisma.eventPoolItem.upsert({
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

  return {
    inserted,
    invalid,
    skipped,
    updated,
  };
}
