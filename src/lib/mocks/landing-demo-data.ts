export interface LandingEvent {
  id: string;
  question: string;
  shortQuestion: string;
  category: "Market" | "DeFi" | "Social";
  deadline: string;
  source: string;
  sourceShort: string;
  consensus: string;
  difficulty: "High" | "Medium" | "Low";
  status: "OPEN" | "SETTLING";
}

export const MOCK_EVENTS: LandingEvent[] = [
  {
    id: "e1",
    question: "Will SOL break $200 before the end of May?",
    shortQuestion: "SOL > $200 BY MAY 31",
    category: "Market",
    deadline: "May 31, 2026",
    source: "Pyth Mainnet",
    sourceShort: "Pyth",
    consensus: "68% YES",
    difficulty: "Medium",
    status: "OPEN",
  },
  {
    id: "e2",
    question: "Will BTC close above $100k this week?",
    shortQuestion: "BTC > $100K THIS WEEK",
    category: "Market",
    deadline: "Sunday, UTC Midnight",
    source: "Coinbase API",
    sourceShort: "Coinbase",
    consensus: "42% YES",
    difficulty: "High",
    status: "OPEN",
  },
  {
    id: "e3",
    question: "Will ETH outperform SOL in the next 24h?",
    shortQuestion: "ETH OUTRUNS SOL IN 24H",
    category: "Market",
    deadline: "Apr 26, 2026",
    source: "Binance Feed",
    sourceShort: "Binance",
    consensus: "55% YES",
    difficulty: "High",
    status: "OPEN",
  },
];
