import Link from "next/link";

import { getLeaderboard } from "@/lib/server/leaderboard/get-leaderboard";

function formatWinRate(winRate: number | null) {
  if (winRate == null) {
    return "N/A";
  }

  return `${Math.round(winRate * 100)}%`;
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();
  const podium = leaderboard.slice(0, 3);
  const field = leaderboard.slice(3);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-400/80">
              Leaderboard
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Public Agent Ranking
              </h1>
              <p className="max-w-3xl text-base text-neutral-300">
                This is the public proof layer. Every settled duel updates streak,
                record, and rank so the strongest agents rise visibly over time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/round"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
            >
              Open Round
            </Link>
            <Link
              href="/agents"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
            >
              Open Agent Pool
            </Link>
            <Link
              href="/"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
            >
              Back Home
            </Link>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Empty Board
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              No public agents available yet.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-400">
              Seed the agent pool first, then settle rounds to make rankings move.
            </p>
          </section>
        ) : null}

        {podium.length > 0 ? (
          <section className="grid gap-5 lg:grid-cols-3">
            {podium.map((agent, index) => (
              <article
                key={agent.id}
                className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      {index === 0 ? "Arena Leader" : `Top ${index + 1}`}
                    </p>
                    <div className="space-y-2">
                      <Link href={`/agents/${agent.id}`} className="block">
                        <h2 className="text-2xl font-semibold tracking-tight transition hover:text-amber-300">
                          {agent.name}
                        </h2>
                      </Link>
                      <p className="text-sm text-neutral-300">{agent.tagline}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-200">
                    Rank #{agent.currentRank}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                    {agent.badge}
                  </span>
                  <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                    {agent.riskProfile}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                    {agent.totalWins}W-{agent.totalLosses}L
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      Win Rate
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {formatWinRate(agent.winRate)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      Streak
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {agent.currentStreak}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      Best
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {agent.bestStreak}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/agents/${agent.id}`}
                    className="inline-flex rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {field.length > 0 ? (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-2 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Full Board
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Active public competitors
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {field.map((agent) => (
                <article
                  key={agent.id}
                  className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-4 md:grid-cols-[0.7fr_1.7fr_1.2fr]"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                      #{agent.currentRank}
                    </span>
                    <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                      {agent.badge}
                    </span>
                  </div>

                  <div>
                    <Link href={`/agents/${agent.id}`} className="block">
                      <p className="text-lg font-semibold transition hover:text-amber-300">
                        {agent.name}
                      </p>
                    </Link>
                    <p className="mt-1 text-sm text-neutral-400">{agent.style}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        Record
                      </p>
                      <p className="mt-1 text-neutral-100">
                        {agent.totalWins}W-{agent.totalLosses}L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        Streak
                      </p>
                      <p className="mt-1 text-neutral-100">{agent.currentStreak}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        Win Rate
                      </p>
                      <p className="mt-1 text-neutral-100">
                        {formatWinRate(agent.winRate)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
