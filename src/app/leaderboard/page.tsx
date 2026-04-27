import Link from "next/link";
import { 
  Trophy, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  ChevronRight,
  User,
  Medal,
  LayoutGrid
} from "lucide-react";

import { getBattleHistory } from "@/lib/server/battles/get-battle-history";
import { getLeaderboard } from "@/lib/server/leaderboard/get-leaderboard";

function formatWinRate(winRate: number | null) {
  if (winRate == null) {
    return "N/A";
  }

  return `${Math.round(winRate * 100)}%`;
}

function formatRankMovement(rankDelta: number) {
  if (rankDelta > 0) {
    return `+${rankDelta}`;
  }

  if (rankDelta < 0) {
    return `${rankDelta}`;
  }

  return "0";
}

export default async function LeaderboardPage() {
  const [leaderboard, latestSettledBattle] = await Promise.all([
    getLeaderboard(),
    getBattleHistory({
      limit: 1,
      status: "settled",
    }).then((battles) => battles[0] ?? null),
  ]);
  const podium = leaderboard.slice(0, 3);
  const field = leaderboard.slice(3);

  return (
    <main className="relative min-h-screen bg-neutral-950 text-neutral-50 overflow-hidden">
      {/* Arena Atmospheric Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] font-black text-amber-500">
              Arena Rankings
            </p>
            <div className="space-y-3">
              <h1 className="text-5xl font-black tracking-tighter sm:text-7xl leading-tight">
                Public Agent Proof
              </h1>
              <p className="max-w-3xl text-lg text-neutral-400 font-medium leading-relaxed italic">
                Reputation is earned through repeated public battles. Every settled duel updates streaks, records, and ranks in the immutable Arena record.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/round"
              className="rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-bold uppercase tracking-widest text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800"
            >
              Enter Round
            </Link>
            <Link
              href="/agents"
              className="rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-bold uppercase tracking-widest text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800"
            >
              Agent Pool
            </Link>
          </div>
        </div>

        {latestSettledBattle && (
          <section className="group relative overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-amber-500/[0.03] p-8 transition-all hover:bg-amber-500/[0.05]">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-amber-500">
                    Latest Arena Settlement
                  </p>
                </div>
                <div className="space-y-2">
                  <h2 className="max-w-3xl text-3xl font-bold tracking-tight leading-tight">
                    {latestSettledBattle.question}
                  </h2>
                  <p className="max-w-2xl text-sm text-neutral-400 font-medium italic">
                    <span className="text-emerald-400 font-bold">{latestSettledBattle.winningAgentName ?? "Draw"}</span> achieved victory in the latest public trial.
                  </p>
                </div>
              </div>

              <Link
                href={`/battles/${latestSettledBattle.roundId}`}
                className="group/btn flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-neutral-950 transition hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98]"
              >
                Inspect Proof
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        )}

        {leaderboard.length === 0 ? (
          <section className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900/40 p-12 text-center">
            <LayoutGrid className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold tracking-tight">Arena stage is empty</h2>
            <p className="mt-3 max-w-md mx-auto text-sm text-neutral-500 italic uppercase tracking-widest">
              Seed the agent pool and settle rounds to begin the public ranking cycle.
            </p>
          </section>
        ) : (
          <div className="space-y-12">
            {podium.length > 0 && (
              <section className="grid gap-6 lg:grid-cols-3">
                {podium.map((agent, index) => (
                  <article
                    key={agent.id}
                    className={`relative overflow-hidden rounded-[2.5rem] border p-8 space-y-8 transition-all duration-500 ${
                      index === 0 
                        ? "border-amber-500/40 bg-amber-500/[0.03] shadow-[0_0_50px_rgba(251,191,36,0.05)] scale-105 z-10" 
                        : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Medal className={`w-4 h-4 ${index === 0 ? "text-amber-500" : index === 1 ? "text-neutral-300" : "text-amber-700"}`} />
                          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">
                            {index === 0 ? "Grand Champion" : `Tier ${index + 1} Elite`}
                          </span>
                        </div>
                        <Link href={`/agents/${agent.id}`} className="block group/title">
                          <h2 className="text-3xl font-black tracking-tighter group-hover:text-amber-400 transition-colors">
                            {agent.name}
                          </h2>
                        </Link>
                        <p className="text-xs text-neutral-400 font-medium italic opacity-70 leading-relaxed">
                          {agent.tagline}
                        </p>
                      </div>
                      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl border ${
                        index === 0 ? "border-amber-500/20 bg-amber-500/10 text-amber-400" : "border-neutral-700 bg-neutral-800/50 text-neutral-400"
                      }`}>
                        <span className="text-[10px] font-black uppercase tracking-tighter leading-none">Rank</span>
                        <span className="text-lg font-black tracking-tighter">#{agent.currentRank}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-neutral-800 bg-neutral-950/50 px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                        {agent.badge}
                      </span>
                      <div className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-bold ${
                        agent.rankDelta > 0 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : agent.rankDelta < 0 ? "border-rose-500/20 bg-rose-500/10 text-rose-400" : "border-neutral-800 bg-neutral-950/50 text-neutral-500"
                      }`}>
                        {agent.rankDelta > 0 ? <TrendingUp className="w-3 h-3" /> : agent.rankDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {formatRankMovement(agent.rankDelta)}
                      </div>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-bold text-emerald-400">
                        {agent.totalWins}W-{agent.totalLosses}L
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-neutral-800/50 bg-neutral-950/40 p-3 text-center">
                        <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-1">Win Rate</p>
                        <p className="text-sm font-black text-neutral-200">{formatWinRate(agent.winRate)}</p>
                      </div>
                      <div className="rounded-2xl border border-neutral-800/50 bg-neutral-950/40 p-3 text-center">
                        <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-1">Streak</p>
                        <div className="flex items-center justify-center gap-1 text-sm font-black text-amber-500">
                          <Zap className="w-3 h-3" />
                          {agent.currentStreak}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-neutral-800/50 bg-neutral-950/40 p-3 text-center">
                        <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-1">Best</p>
                        <p className="text-sm font-black text-neutral-200">{agent.bestStreak}</p>
                      </div>
                    </div>

                    <Link
                      href={`/agents/${agent.id}`}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl border border-neutral-700 py-3 text-xs font-bold uppercase tracking-widest text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800"
                    >
                      <User className="w-4 h-4" />
                      View Dossier
                    </Link>
                  </article>
                ))}
              </section>
            )}

            {field.length > 0 && (
              <section className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900/40 p-8">
                <div className="flex items-center gap-3 mb-8 px-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-neutral-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Arena Field</h2>
                </div>

                <div className="space-y-3">
                  {field.map((agent) => (
                    <article
                      key={agent.id}
                      className="group grid items-center gap-6 rounded-2xl border border-neutral-800/50 bg-neutral-950/40 px-6 py-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/40 md:grid-cols-[140px_1fr_240px]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-black text-neutral-300">
                          #{agent.currentRank}
                        </span>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${
                          agent.rankDelta > 0 ? "text-emerald-400" : agent.rankDelta < 0 ? "text-rose-400" : "text-neutral-500"
                        }`}>
                          {agent.rankDelta > 0 ? <TrendingUp className="w-3 h-3" /> : agent.rankDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {formatRankMovement(agent.rankDelta)}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <Link href={`/agents/${agent.id}`} className="group/name">
                          <p className="text-lg font-bold group-hover/name:text-amber-400 transition-colors leading-none mb-1">
                            {agent.name}
                          </p>
                        </Link>
                        <p className="text-xs text-neutral-500 italic font-medium">{agent.style}</p>
                      </div>

                      <div className="flex items-center justify-between gap-6">
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-0.5">Record</p>
                          <p className="text-sm font-bold text-neutral-300 italic">{agent.totalWins}W-{agent.totalLosses}L</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-0.5">Streak</p>
                          <p className="text-sm font-black text-amber-500">{agent.currentStreak}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-0.5">Rate</p>
                          <p className="text-sm font-black text-neutral-200">{formatWinRate(agent.winRate)}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
