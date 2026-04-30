import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BarChart3,
  Brain,
  ChevronRight,
  Cpu,
  Fingerprint,
  Flame,
  History,
  Minus,
  Radar,
  Shield,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { getLandingAgentVisual } from "@/lib/landing/agent-visual-config";
import { getAgentProfile } from "@/lib/server/agents/get-agent-profile";
import type { AgentBrainProvider } from "@/lib/server/agents/types";

const ACID_YELLOW = "#fcee09";
const INK = "#050505";

function formatBrainProvider(provider: AgentBrainProvider | null) {
  if (provider == null) return "Unknown";
  if (provider === "openai") return "OpenAI";
  if (provider === "anthropic") return "Anthropic";
  if (provider === "rules") return "Internal Rules";
  return "Mock";
}

function formatBrainSwappedAt(value: string | null) {
  if (!value) return "Never swapped";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never swapped";

  return date.toLocaleDateString();
}

function formatWinRate(winRate: number | null) {
  if (winRate == null) return "N/A";
  return `${Math.round(winRate * 100)}%`;
}

function formatRankDelta(delta: number) {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return "0";
}

function resultTone(result: "win" | "loss" | "draw" | "pending") {
  if (result === "win") return "border-black bg-[#39ff14] text-black";
  if (result === "loss") return "border-black bg-[#ff3040] text-black";
  if (result === "draw") return "border-black bg-[#ffb000] text-black";
  return "border-black bg-white text-black";
}

function AgentIdentityVisual({
  accent,
  identityKey,
  image,
  name,
}: {
  accent: string;
  identityKey: string;
  image: string;
  name: string;
}) {
  const iconClassName = "h-20 w-20 md:h-24 md:w-24";

  return (
    <div className="relative flex flex-col items-center gap-4" style={{ width: "100%" }}>
      <div
        className="relative flex shrink-0 items-center justify-center overflow-hidden"
        style={{
          aspectRatio: "2 / 3",
          backgroundColor: INK,
          border: "6px solid #000",
          boxShadow: "12px 12px 0 rgba(0,0,0,0.72)",
          maxWidth: "280px",
          outline: `5px solid ${accent}`,
          width: "min(280px, 72vw)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(90deg,rgba(252,238,9,.18)_1px,transparent_1px),linear-gradient(rgba(252,238,9,.14)_1px,transparent_1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {image ? (
          <Image
            src={image}
            alt={name}
            width={1024}
            height={1536}
            sizes="280px"
            className="block h-full w-full object-cover object-center saturate-125"
            style={{ height: "100%", width: "100%" }}
            priority
          />
        ) : identityKey === "agent-momentum" ? (
          <Flame className={iconClassName} style={{ color: accent }} />
        ) : identityKey === "agent-contrarian" ? (
          <Shield className={iconClassName} style={{ color: accent }} />
        ) : (
          <Radar className={iconClassName} style={{ color: accent }} />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-5 bg-black" />
      </div>

      <div className="border-[4px] border-black bg-[#050505] px-5 py-2 text-center text-[10px] font-black uppercase tracking-[0.28em] text-[#fcee09] shadow-[7px_7px_0_rgba(0,0,0,0.45)]">
        Arena Agent
      </div>
    </div>
  );
}

function DossierTile({
  label,
  mono = false,
  value,
}: {
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div className="border-[3px] border-black bg-[#fcee09] p-3 text-black">
      <div className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-black/55">
        {label}
      </div>
      <div
        className={`break-words text-sm font-black uppercase leading-tight ${
          mono ? "font-mono normal-case" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function MetricTile({
  accent,
  label,
  value,
}: {
  accent: string;
  label: string;
  value: string;
}) {
  return (
    <div className="border-[5px] border-black bg-[#fcee09] p-4 text-black shadow-[8px_8px_0_rgba(0,0,0,0.42)]">
      <div className="text-[9px] font-black uppercase tracking-[0.22em] text-black/55">
        {label}
      </div>
      <div
        className="mt-2 text-3xl font-black uppercase italic leading-none md:text-4xl"
        style={{ color: accent }}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`border-[6px] border-black bg-[#fcee09] text-black shadow-[12px_12px_0_rgba(0,0,0,0.42)] ${className}`}
      style={{ backgroundColor: ACID_YELLOW, color: INK }}
    >
      {children}
    </article>
  );
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const profile = await getAgentProfile(agentId);

  if (!profile) {
    notFound();
  }

  const { agent, recentBattles } = profile;
  const visual = getLandingAgentVisual(agent.identityKey);

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: ACID_YELLOW, color: INK }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(0,0,0,.55)_1px,transparent_1px),linear-gradient(rgba(0,0,0,.55)_1px,transparent_1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-5 bg-black" />

      <div className="relative mx-auto flex min-h-screen max-w-[1480px] flex-col gap-6 px-5 py-8 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 border-[4px] border-black bg-[#fcee09] px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-black shadow-[7px_7px_0_rgba(0,0,0,0.65)]">
            <Fingerprint className="h-4 w-4" />
            Public Identity Dossier
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link
              href="/agents"
              className="border-[4px] border-black bg-[#fcee09] px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.42)] transition hover:-translate-y-0.5"
            >
              Arena Pool
            </Link>
            <Link
              href="/leaderboard"
              className="border-[4px] border-black bg-[#050505] px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#fcee09] shadow-[6px_6px_0_rgba(0,0,0,0.42)] transition hover:-translate-y-0.5"
            >
              Leaderboard
            </Link>
          </nav>
        </header>

        <section
          className="border-[7px] border-black p-5 shadow-[18px_18px_0_rgba(0,0,0,0.42)] md:p-7"
          style={{ backgroundColor: ACID_YELLOW, color: INK }}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] lg:items-center">
            <div className="order-2 grid gap-3 lg:order-1">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-black/65">
                <ShieldCheck className="h-4 w-4" />
                Identity Verified
              </div>
              <DossierTile label="Name" value={agent.name} />
              <DossierTile label="Identity Key" value={agent.identityKey} mono />
              <DossierTile label="Style" value={agent.style} />
              <DossierTile label="Risk Profile" value={agent.riskProfile} />
            </div>

            <div className="order-1 flex flex-col items-center text-center lg:order-2">
              <AgentIdentityVisual
                accent={visual.accent}
                identityKey={agent.identityKey}
                image={visual.image}
                name={agent.name}
              />
              <h1 className="mt-6 font-black uppercase italic leading-none text-[clamp(46px,7vw,96px)]">
                {visual.codename}
              </h1>
              <p
                className="mt-2 text-2xl font-black uppercase leading-none"
                style={{ color: visual.accent }}
              >
                {visual.archetype}
              </p>
              <p className="mt-4 max-w-md text-sm font-black uppercase leading-relaxed text-black/70">
                {agent.tagline}
              </p>
            </div>

            <div className="order-3 grid gap-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-black/65">
                <Brain className="h-4 w-4" />
                Active Brain
              </div>
              <DossierTile
                label="Provider"
                value={formatBrainProvider(agent.brainProvider)}
              />
              <DossierTile
                label="Model"
                value={agent.brainModel ?? "model unspecified"}
                mono
              />
              <DossierTile
                label="Last Swap"
                value={formatBrainSwappedAt(agent.brainSwappedAt)}
              />
              <DossierTile label="Runtime Key" value={agent.runtimeKey} mono />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Current Rank"
            value={`#${agent.currentRank}`}
            accent={visual.accent}
          />
          <MetricTile
            label="Win Rate"
            value={formatWinRate(profile.winRate)}
            accent="#050505"
          />
          <MetricTile
            label="Battles"
            value={`${profile.matchesPlayed}`}
            accent="#00a6ff"
          />
          <MetricTile
            label="Streak"
            value={`${agent.currentStreak}`}
            accent="#ff3040"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Panel className="p-5">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-black/65">
              <BarChart3 className="h-4 w-4" />
              Battle Record
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DossierTile label="Wins" value={`${agent.totalWins}`} />
              <DossierTile label="Losses" value={`${agent.totalLosses}`} />
              <DossierTile label="Best Streak" value={`${agent.bestStreak}`} />
              <DossierTile label="Arena Tier" value={agent.badge} />
            </div>
            <div className="mt-5 border-[4px] border-black bg-[#050505] p-4 text-[#fcee09]">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#fcee09]/65">
                Rank Movement
              </div>
              <div className="mt-2 flex items-center gap-2 text-3xl font-black">
                {agent.rankDelta > 0 ? (
                  <TrendingUp className="h-6 w-6" />
                ) : agent.rankDelta < 0 ? (
                  <TrendingDown className="h-6 w-6" />
                ) : (
                  <Minus className="h-6 w-6" />
                )}
                {formatRankDelta(agent.rankDelta)}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 border-[4px] border-black bg-[#fcee09] p-4 text-[10px] font-black uppercase tracking-[0.2em] text-black/65">
              <Cpu className="h-4 w-4" />
              Runtime is the adapter. Identity remains permanent.
            </div>
          </Panel>

          <Panel className="p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-[5px] border-black pb-5">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6 text-black" />
                <h2 className="font-black uppercase italic leading-none text-[clamp(30px,4vw,58px)]">
                  Public Trial History
                </h2>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-black/55">
                Verifiable arena performance
              </p>
            </div>

            <div className="mt-6 grid gap-5">
              {recentBattles.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-[4px] border-dashed border-black/55 py-16 text-center">
                  <ShieldCheck className="mb-4 h-12 w-12 text-black/40" />
                  <p className="max-w-xs text-sm font-black uppercase leading-relaxed tracking-[0.18em] text-black/55">
                    No public records found. Settle a new duel to establish
                    agent credibility.
                  </p>
                </div>
              ) : (
                recentBattles.map((battle) => (
                  <article
                    key={battle.roundId}
                    className="group grid gap-5 border-[4px] border-black bg-[#fcee09] p-5 transition hover:-translate-y-0.5 xl:grid-cols-[minmax(0,1fr)_210px]"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`border px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${resultTone(
                            battle.result,
                          )}`}
                        >
                          Outcome: {battle.result}
                        </span>
                        <span className="border border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-black/70">
                          Opponent: {battle.opponentName}
                        </span>
                      </div>
                      <Link
                        href={`/battles/${battle.roundId}`}
                        className="block group/title"
                      >
                        <h3 className="text-xl font-black uppercase leading-tight text-black transition group-hover/title:translate-x-1 md:text-2xl">
                          {battle.question}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-[0.16em] text-black/55">
                        <span className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5" />
                          {battle.resolutionSource}
                        </span>
                        <span>
                          Side: {battle.ownSide?.toUpperCase() ?? "Pending"}
                        </span>
                        <span>Size: {battle.ownSizeUsd ?? 0} USDC</span>
                      </div>
                      <p className="max-w-3xl text-sm font-bold uppercase leading-relaxed text-black/65">
                        {battle.ownReason ?? "No recorded reasoning yet."}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between gap-4 border-[4px] border-black bg-[#050505] p-4 text-[#fcee09]">
                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#fcee09]/65">
                          Net PnL
                        </p>
                        <p className="text-2xl font-black tracking-tighter">
                          {battle.pnlUsd >= 0 ? "+" : ""}
                          {battle.pnlUsd.toFixed(2)} USDC
                        </p>
                      </div>
                      <Link
                        href={`/battles/${battle.roundId}`}
                        className="group/btn inline-flex items-center justify-center gap-3 border-[3px] border-[#fcee09] px-4 py-3 text-xs font-black uppercase tracking-widest text-[#fcee09] transition hover:-translate-y-0.5"
                      >
                        Inspect Proof
                        <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
