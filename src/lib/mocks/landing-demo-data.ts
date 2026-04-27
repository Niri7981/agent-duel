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

export interface LandingAgent {
  id: string;
  name: string;
  codename: string;
  archetype: string;
  model: string;
  style: string;
  role: string;
  riskProfile: "AGGRESSIVE" | "CONSERVATIVE" | "BALANCED";
  rank: number;
  winRate: string;
  streak: number;
  badge: string;
  image: string;
  color: string;
  accent: string;
  description: string;
  strategy: string;
  strengths: string[];
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

export const MOCK_AGENTS: LandingAgent[] = [
  {
    id: "momentum",
    name: "Momentum Agent",
    codename: "MOMENTUM",
    archetype: "AGGRO",
    model: "Gemini 3 Pro",
    style: "The Trend Chaser",
    role: "Aggressive Combatant",
    riskProfile: "AGGRESSIVE",
    rank: 11,
    winRate: "63%",
    streak: 9,
    badge: "Blitz Victor",
    image: "/agents/momentum-agent-card.png",
    color: "#ff4d4d", // Red-Orange
    accent: "#ff8a1f",
    description: "Cuts through noise. Rides strength. Breaks first.",
    strategy: "Momentum builds strong buy signals and rides them until the trend exhausts.",
    strengths: ["Speed", "Kinetic Energy", "Trend Following"],
  },
  {
    id: "contrarian",
    name: "Contrarian Agent",
    codename: "CONTRARIAN",
    archetype: "SLY",
    model: "Gemini 3 Pro",
    style: "The Market Skeptic",
    role: "Strategic Shield",
    riskProfile: "BALANCED",
    rank: 24,
    winRate: "72%",
    streak: 3,
    badge: "Hologram Master",
    image: "/agents/contrarian-agent-card.png",
    color: "#10b981", // Teal-Green
    accent: "#42f5c8",
    description: "Thinks different. Profits from crowd mistakes.",
    strategy: "Fades against the crowd when exhaustion is detected in market consensus.",
    strengths: ["Strategic Counters", "Resilience", "Shield Logic"],
  },
  {
    id: "news",
    name: "News Agent",
    codename: "NEWSWIRE",
    archetype: "SIGNAL",
    model: "Gemini 3 Pro",
    style: "The Signal Hunter",
    role: "Information Striker",
    riskProfile: "CONSERVATIVE",
    rank: 18,
    winRate: "67%",
    streak: 5,
    badge: "Signal Crown",
    image: "",
    color: "#2563eb",
    accent: "#38bdf8",
    description: "Reads the live narrative. Spots catalysts before they become consensus.",
    strategy: "News Agent weighs event timing, source credibility, and narrative velocity before committing.",
    strengths: ["Catalyst Detection", "Source Discipline", "Fast Context"],
  },
];
