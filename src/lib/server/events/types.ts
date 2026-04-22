export type ExternalEventSourceKey = "polymarket";

export type EventPoolStatus =
  | "candidate"
  | "ready"
  | "live"
  | "settled"
  | "archived";

export type EventPoolCategory =
  | "crypto"
  | "macro"
  | "headline"
  | "sports"
  | "other";

// 这是 arena 内部统一使用的 normalized event 结构。
// 后面的 round、selection、profile、leaderboard 都只应该依赖这个形状，
// 不应该直接依赖任何外部事件源的原始字段。
export type InternalEventPoolItem = {
  id: string;
  sourceKey: ExternalEventSourceKey;
  externalEventId: string;
  externalMarketId: string | null;
  slug: string | null;
  title: string;
  question: string;
  category: EventPoolCategory;
  marketSymbol: string;
  yesLabel: string;
  noLabel: string;
  startsAt: Date | null;
  endsAt: Date | null;
  durationSeconds: number;
  resolutionSource: string;
  sourceLabel: string;
  externalUrl: string | null;
  currentPrice: number | null;
  volumeUsd: number | null;
  liquidityScore: number | null;
  status: EventPoolStatus;
  playable: boolean;
  spectatorNote: string;
  stageLabel: string;
};

export type GetEventPoolInput = {
  category?: EventPoolCategory;
  includeUnplayable?: boolean;
  limit?: number;
  status?: EventPoolStatus | EventPoolStatus[];
};

export type SeedEventPoolResult = {
  inserted: number;
  invalid: number;
  skipped: number;
  updated: number;
};
