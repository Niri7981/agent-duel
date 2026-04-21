export type DemoMarketInput = {
  durationSeconds?: number;
  marketSymbol?: string;
  startsAt?: Date;
};

export type DemoMarketSnapshot = {
  currentPrice: number;
  endsAt: Date;
  marketSymbol: string;
  question: string;
  resolutionSource: string;
  startPrice: number;
  startsAt: Date;
};

const DEFAULT_MARKET_SYMBOL = "SOL";
const DEFAULT_DURATION_SECONDS = 5 * 60;

const DEMO_PRICES: Record<string, number> = {
  BTC: 101_250,
  ETH: 3_240,
  SOL: 152.4,
};

function formatDurationLabel(durationSeconds: number) {
  if (durationSeconds % 60 === 0) {
    const minutes = durationSeconds / 60;

    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  return `${durationSeconds} second${durationSeconds === 1 ? "" : "s"}`;
}

export function buildDemoMarket(input: DemoMarketInput = {}): DemoMarketSnapshot {
  const durationSeconds = input.durationSeconds ?? DEFAULT_DURATION_SECONDS;
  const marketSymbol = input.marketSymbol ?? DEFAULT_MARKET_SYMBOL;
  const startsAt = input.startsAt ?? new Date();
  const endsAt = new Date(startsAt.getTime() + durationSeconds * 1000);
  const currentPrice = DEMO_PRICES[marketSymbol] ?? 1;
  const durationLabel = formatDurationLabel(durationSeconds);

  return {
    currentPrice,
    endsAt,
    marketSymbol,
    question: `Will ${marketSymbol} be above the current price in ${durationLabel}?`,
    resolutionSource: "Demo market oracle",
    startPrice: currentPrice,
    startsAt,
  };
}
