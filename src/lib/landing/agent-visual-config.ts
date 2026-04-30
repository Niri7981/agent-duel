// 这里在干嘛：
// 把落地页专用的视觉配置和数据库里的 agent 主数据分开。
// 为什么这么写：
// DB 应该负责永久身份、战绩和 brain；颜色、插画、archetype 是前端包装层。
// 最后返回什么：
// 按 identityKey 返回一份 landing 卡片可以直接使用的视觉配置。

export type LandingAgentVisual = {
  accent: string;
  archetype: string;
  codename: string;
  color: string;
  description: string;
  image: string;
  riskLabel: "AGGRESSIVE" | "CONSERVATIVE" | "BALANCED";
  strengths: string[];
};

export const LANDING_AGENT_VISUALS: Record<string, LandingAgentVisual> = {
  "agent-contrarian": {
    accent: "#42f5c8",
    archetype: "SLY",
    codename: "CONTRARIAN",
    color: "#10b981",
    description: "Thinks different. Profits from crowd mistakes.",
    image: "/agents/contrarian-agent-card.png",
    riskLabel: "BALANCED",
    strengths: ["Strategic Counters", "Resilience", "Shield Logic"],
  },
  "agent-macro": {
    accent: "#fbbf24",
    archetype: "ORACLE",
    codename: "MACRO",
    color: "#f59e0b",
    description: "Tracks regime shifts and rides the dominant macro narrative.",
    image: "",
    riskLabel: "AGGRESSIVE",
    strengths: ["Narrative Velocity", "Regime Detection", "Macro Cycles"],
  },
  "agent-momentum": {
    accent: "#ff8a1f",
    archetype: "AGGRO",
    codename: "MOMENTUM",
    color: "#ff4d4d",
    description: "Cuts through noise. Rides strength. Breaks first.",
    image: "/agents/momentum-agent-card.png",
    riskLabel: "AGGRESSIVE",
    strengths: ["Speed", "Kinetic Energy", "Trend Following"],
  },
  "agent-news": {
    accent: "#38bdf8",
    archetype: "SIGNAL",
    codename: "NEWSWIRE",
    color: "#2563eb",
    description:
      "Reads the live narrative. Spots catalysts before they become consensus.",
    image: "",
    riskLabel: "CONSERVATIVE",
    strengths: ["Catalyst Detection", "Source Discipline", "Fast Context"],
  },
  "agent-quant": {
    accent: "#d8b4fe",
    archetype: "PRECISION",
    codename: "QUANTUM",
    color: "#a855f7",
    description:
      "Microstructure obsessed. Sizes by conviction interval, never bankroll.",
    image: "",
    riskLabel: "BALANCED",
    strengths: ["Mean Reversion", "Disciplined Sizing", "Microstructure"],
  },
};

const FALLBACK_VISUAL: LandingAgentVisual = {
  accent: "#a3a3a3",
  archetype: "GENERIC",
  codename: "AGENT",
  color: "#737373",
  description: "An emerging contender in the arena.",
  image: "",
  riskLabel: "BALANCED",
  strengths: ["Adaptive", "Emerging", "Untested"],
};

export function getLandingAgentVisual(identityKey: string): LandingAgentVisual {
  return LANDING_AGENT_VISUALS[identityKey] ?? FALLBACK_VISUAL;
}
