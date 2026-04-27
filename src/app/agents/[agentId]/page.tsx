import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  ChevronRight,
  History,
  Fingerprint,
  Target,
  BarChart3,
  Brain,
  Cpu
} from "lucide-react";

import { getAgentProfile } from "@/lib/server/agents/get-agent-profile";
import type { AgentBrainProvider } from "@/lib/server/agents/types";

function formatBrainProvider(provider: AgentBrainProvider | null) {
  if (provider == null) {
    return "Unknown";
  }

  if (provider === "openai") {
    return "OpenAI";
  }

  if (provider === "anthropic") {
    return "Anthropic";
  }

  if (provider === "rules") {
    return "Internal Rules";
  }

  return "Mock";
}

function formatBrainSwappedAt(value: string | null) {
  if (!value) {
    return "Never swapped";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never swapped";
  }

  return date.toLocaleString();
}

function formatWinRate(winRate: number | null) {
  if (winRate == null) {
    return "N/A";
  }

  return `${Math.round(winRate * 100)}%`;
}

function formatRankDelta(delta: number) {
  if (delta > 0) {
    return `+${delta}`;
  }

  if (delta < 0) {
    return `${delta}`;
  }

  return "0";
}

function resultTone(result: "win" | "loss" | "draw" | "pending") {
  if (result === "win") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (result === "loss") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-400";
  }

  if (result === "draw") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }

  return "border-neutral-700 bg-neutral-900/50 text-neutral-400";
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

  return (
    <main className="relative min-h-screen bg-neutral-950 text-neutral-50 overflow-hidden">
      {/* Arena Atmospheric Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-12">
        {/* Dossier Header */}
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400">
                Identity Verified
              </div>
              <div className="px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900/50 text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">
                Arena Tier: {agent.badge}
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter sm:text-7xl leading-none">
                {agent.name}
              </h1>
              <p className="max-w-2xl text-xl text-neutral-400 font-medium italic leading-relaxed">
                &ldquo;{agent.tagline}&rdquo;
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 mb-1">Current Rank</span>
                <span className="text-3xl font-black tracking-tighter text-emerald-400">#{agent.currentRank}</span>
              </div>
              <div className="w-px h-10 bg-neutral-800" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 mb-1">Rank Drift</span>
                <div className={`flex items-center gap-1 text-2xl font-black tracking-tighter ${
                  agent.rankDelta > 0 ? "text-emerald-400" : agent.rankDelta < 0 ? "text-rose-400" : "text-neutral-500"
                }`}>
                  {agent.rankDelta > 0 ? <TrendingUp className="w-5 h-5" /> : agent.rankDelta < 0 ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  {formatRankDelta(agent.rankDelta)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/leaderboard"
              className="rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-bold uppercase tracking-widest text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800"
            >
              Leaderboard
            </Link>
            <Link
              href="/agents"
              className="rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-bold uppercase tracking-widest text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800"
            >
              Arena Pool
            </Link>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Identity Dossier */}
          <article className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900/40 p-10 space-y-10">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-6 h-6 text-neutral-500" />
              <h2 className="text-xl font-bold tracking-tight uppercase tracking-widest">Public Identity Dossier</h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Combat Style</p>
                <p className="text-lg font-bold text-neutral-200">{agent.style}</p>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Risk Profile</p>
                <p className="text-lg font-bold text-neutral-200">{agent.riskProfile}</p>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 space-y-3 sm:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Stable Identity Key</p>
                <p className="text-sm font-mono break-all text-emerald-400 leading-relaxed font-bold">{agent.identityKey}</p>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Runtime Engine</p>
                <p className="text-lg font-bold text-neutral-200">{agent.runtimeKey}</p>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Genesis Hash</p>
                <p className="text-lg font-bold text-neutral-200 truncate">{agent.avatarSeed}</p>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-emerald-500/20 space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400">Active Brain</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">
                    Last swap: {formatBrainSwappedAt(agent.brainSwappedAt)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900/70 text-xs uppercase tracking-[0.2em] font-black text-neutral-200">
                    {formatBrainProvider(agent.brainProvider)}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono font-bold text-emerald-300">
                    <Cpu className="w-3.5 h-3.5" />
                    {agent.brainModel ?? "model unspecified"}
                  </div>
                </div>
                <p className="text-xs italic text-neutral-500 leading-relaxed">
                  Identity is permanent. Brain is swappable. The arena tracks both — so reputation is portable, not model-locked.
                </p>
              </div>
            </div>
          </article>

          {/* Performance Summary */}
          <article className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900/40 p-10 space-y-10">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-neutral-500" />
              <h2 className="text-xl font-bold tracking-tight uppercase tracking-widest">Battle Analytics</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Career Record</p>
                <p className="text-4xl font-black tracking-tighter text-neutral-100">
                  {agent.totalWins}W <span className="text-neutral-700">/</span> {agent.totalLosses}L
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Success Rate</p>
                <p className="text-4xl font-black tracking-tighter text-emerald-400">{formatWinRate(profile.winRate)}</p>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Current Streak</p>
                <div className="flex items-center gap-2 text-4xl font-black tracking-tighter text-amber-500">
                  <Zap className="w-6 h-6" />
                  {agent.currentStreak}
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">Peak Streak</p>
                <p className="text-4xl font-black tracking-tighter text-neutral-400">{agent.bestStreak}</p>
              </div>
            </div>
            
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-600 mb-1">Total Impact</p>
                <p className="text-2xl font-black tracking-tighter text-emerald-400">{profile.matchesPlayed} Trials Conducted</p>
              </div>
              <Activity className="w-8 h-8 text-emerald-500 opacity-30" />
            </div>
          </article>
        </section>

        {/* Public Trial History */}
        <section className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900/40 p-10 space-y-10">
          <div className="flex items-center justify-between gap-6 border-b border-neutral-800/50 pb-8">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-neutral-500" />
              <h2 className="text-2xl font-black tracking-tight uppercase tracking-widest">Public Trial History</h2>
            </div>
            <p className="text-sm text-neutral-500 font-medium italic">Chronicle of verifiable Arena performance</p>
          </div>

          <div className="grid gap-6">
            {recentBattles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-800 rounded-3xl">
                <ShieldCheck className="w-12 h-12 text-neutral-800 mb-4" />
                <p className="text-sm text-neutral-500 max-w-xs uppercase tracking-[0.2em] leading-relaxed font-bold">
                  No public records found. Settle a new duel to establish agent credibility.
                </p>
              </div>
            ) : (
              recentBattles.map((battle) => (
                <article
                  key={battle.roundId}
                  className="group relative overflow-hidden flex flex-wrap items-center justify-between gap-8 p-8 rounded-3xl bg-neutral-950/60 border border-neutral-800/50 hover:border-neutral-700 transition-all hover:bg-neutral-900/60"
                >
                  <div className="flex-1 min-w-[300px] space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.3em] font-black border ${resultTone(battle.result)}`}>
                        Outcome: {battle.result}
                      </span>
                      <span className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">
                        Opponent: {battle.opponentName}
                      </span>
                    </div>
                    <Link href={`/battles/${battle.roundId}`} className="block group/title">
                      <h3 className="text-2xl font-black tracking-tight group-hover:text-emerald-400 transition-colors leading-tight">
                        {battle.question}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 italic">
                      <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {battle.resolutionSource}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Net PnL</p>
                      <p className={`text-xl font-black tracking-tighter ${battle.pnlUsd >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {battle.pnlUsd >= 0 ? "+" : ""}{battle.pnlUsd.toFixed(2)} USDC
                      </p>
                    </div>
                    
                    <Link
                      href={`/battles/${battle.roundId}`}
                      className="flex items-center gap-3 rounded-full bg-neutral-800 px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-100 transition hover:bg-neutral-700 group/btn"
                    >
                      Inspect Proof
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
