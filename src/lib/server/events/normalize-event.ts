import type {
  EventPoolCategory,
  EventPoolStatus,
  InternalEventPoolItem,
} from "./types";
import type { PolymarketRawEventCandidate } from "./sources/polymarket";

const SUPPORTED_ARENA_SYMBOLS = new Set(["BTC", "ETH", "SOL"]);
const MIN_EVENT_LEAD_MINUTES = 10;
const MAX_EVENT_HORIZON_DAYS = 30;

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function readStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => readString(entry))
      .filter((entry): entry is string => entry !== null);
  }

  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value) as unknown;

      return readStringArray(parsed);
    } catch {
      return [];
    }
  }

  return [];
}

function inferMarketSymbol(question: string) {
  const upperQuestion = question.toUpperCase();

  if (upperQuestion.includes("BTC") || upperQuestion.includes("BITCOIN")) {
    return "BTC";
  }

  if (upperQuestion.includes("ETH") || upperQuestion.includes("ETHEREUM")) {
    return "ETH";
  }

  if (upperQuestion.includes("SOL") || upperQuestion.includes("SOLANA")) {
    return "SOL";
  }

  return "GENERIC";
}

function inferCategory(question: string, eventCategory: string | null): EventPoolCategory {
  const normalizedCategory = eventCategory?.toLowerCase() ?? "";
  const upperQuestion = question.toUpperCase();

  if (
    normalizedCategory.includes("crypto") ||
    upperQuestion.includes("BTC") ||
    upperQuestion.includes("ETH") ||
    upperQuestion.includes("SOL")
  ) {
    return "crypto";
  }

  if (
    normalizedCategory.includes("politic") ||
    normalizedCategory.includes("macro") ||
    normalizedCategory.includes("econom")
  ) {
    return "macro";
  }

  if (normalizedCategory.includes("sport")) {
    return "sports";
  }

  if (normalizedCategory.includes("news")) {
    return "headline";
  }

  return "other";
}

function inferDurationSeconds(startsAt: Date | null, endsAt: Date | null) {
  if (!startsAt || !endsAt) {
    return 10 * 60;
  }

  const seconds = Math.floor((endsAt.getTime() - startsAt.getTime()) / 1000);

  if (seconds <= 0) {
    return 10 * 60;
  }

  return Math.min(seconds, 60 * 60);
}

function inferStatus(
  endsAt: Date | null,
  activeFlag: boolean,
  closedFlag: boolean,
): EventPoolStatus {
  if (closedFlag) {
    return "settled";
  }

  if (endsAt && endsAt.getTime() <= Date.now()) {
    return "settled";
  }

  return activeFlag ? "ready" : "candidate";
}

function inferPlayable(params: {
  activeFlag: boolean;
  closedFlag: boolean;
  endsAt: Date | null;
  category: EventPoolCategory;
  marketSymbol: string;
  question: string;
  yesLabel: string;
  noLabel: string;
}) {
  if (params.closedFlag || !params.activeFlag) {
    return false;
  }

  if (!params.question.endsWith("?")) {
    return false;
  }

  if (!params.yesLabel || !params.noLabel) {
    return false;
  }

  if (!SUPPORTED_ARENA_SYMBOLS.has(params.marketSymbol)) {
    return false;
  }

  if (params.category !== "crypto") {
    return false;
  }

  if (!params.endsAt) {
    return false;
  }

  const now = Date.now();
  const minLeadMs = MIN_EVENT_LEAD_MINUTES * 60 * 1000;
  const maxHorizonMs = MAX_EVENT_HORIZON_DAYS * 24 * 60 * 60 * 1000;
  const endsAtMs = params.endsAt.getTime();

  if (endsAtMs <= now + minLeadMs) {
    return false;
  }

  if (endsAtMs > now + maxHorizonMs) {
    return false;
  }

  return true;
}

function inferSpectatorNote(category: EventPoolCategory) {
  if (category === "crypto") {
    return "Clear binary framing and easy scoreboard storytelling.";
  }

  if (category === "macro") {
    return "Big external narrative gives the round obvious stakes.";
  }

  if (category === "sports") {
    return "Fast spectator comprehension and clean rivalry framing.";
  }

  return "Readable question with enough clarity for a public battle.";
}

function inferStageLabel(category: EventPoolCategory) {
  if (category === "crypto") {
    return "Market Stage";
  }

  if (category === "macro") {
    return "Macro Stage";
  }

  if (category === "sports") {
    return "Showdown Stage";
  }

  return "Arena Stage";
}

// normalize-event.ts 的职责只有一个：
// 把外部 source 的原始 candidate 转成 arena 自己的内部事件格式。
// 如果这条原始记录连基础可玩性都不满足，就直接返回 null。
export function normalizePolymarketEvent(
  candidate: PolymarketRawEventCandidate,
): Omit<InternalEventPoolItem, "id"> | null {
  const event = candidate.event as Record<string, unknown>;
  const market = (candidate.market ?? {}) as Record<string, unknown>;
  const externalEventId =
    readString(event.id) ??
    readString(event.eventId) ??
    readString(event.event_id);

  if (!externalEventId) {
    return null;
  }

  const title =
    readString(event.title) ??
    readString(event.question) ??
    readString(market.question);
  const question =
    readString(market.question) ??
    readString(event.question) ??
    title;

  if (!title || !question) {
    return null;
  }

  const startsAt =
    readDate(market.startDate) ??
    readDate(event.startDate) ??
    readDate(event.startTime);
  const endsAt =
    readDate(market.endDate) ??
    readDate(event.endDate) ??
    readDate(event.endTime);
  const marketOutcomes = readStringArray(market.outcomes);
  const eventOutcomes = readStringArray(event.outcomes);
  const outcomes = marketOutcomes.length > 0 ? marketOutcomes : eventOutcomes;
  const yesLabel = outcomes[0] ?? "Yes";
  const noLabel = outcomes[1] ?? "No";
  const marketSymbol = inferMarketSymbol(question);
  const category = inferCategory(question, readString(event.category));
  const activeFlag = Boolean(market.active ?? event.active ?? true);
  const closedFlag = Boolean(market.closed ?? event.closed ?? false);
  const slug = readString(event.slug) ?? readString(market.slug);
  const currentPrice =
    readNumber(market.lastTradePrice) ??
    readNumber(market.currentPrice) ??
    readStringArray(market.outcomePrices)
      .map((value) => readNumber(value))
      .find((value): value is number => value !== null) ??
    null;
  const volumeUsd =
    readNumber(market.volumeNum) ??
    readNumber(market.volume) ??
    readNumber(event.volume) ??
    null;
  const liquidityScore =
    readNumber(market.liquidityNum) ??
    readNumber(market.liquidity) ??
    null;
  const playable = inferPlayable({
    activeFlag,
    category,
    closedFlag,
    endsAt,
    marketSymbol,
    noLabel,
    question,
    yesLabel,
  });

  if (!playable) {
    return null;
  }

  return {
    category,
    currentPrice,
    durationSeconds: inferDurationSeconds(startsAt, endsAt),
    endsAt,
    externalEventId,
    externalMarketId: readString(market.id),
    externalUrl:
      readString(event.url) ??
      readString(market.url) ??
      (slug ? `https://polymarket.com/event/${slug}` : null),
    liquidityScore,
    marketSymbol,
    noLabel,
    playable,
    question,
    resolutionSource: "Polymarket market resolution",
    sourceKey: "polymarket",
    sourceLabel: "Polymarket candidate feed",
    spectatorNote: inferSpectatorNote(category),
    stageLabel: inferStageLabel(category),
    startsAt,
    status: inferStatus(endsAt, activeFlag, closedFlag),
    slug,
    title,
    volumeUsd,
    yesLabel,
  };
}
