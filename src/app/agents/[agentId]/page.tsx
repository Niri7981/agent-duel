import Link from "next/link";
import { notFound } from "next/navigation";

import { getAgentProfile } from "@/lib/server/agents/get-agent-profile";

function formatWinRate(winRate: number | null) {
  if (winRate == null) {
    return "N/A";
  }

  return `${Math.round(winRate * 100)}%`;
}

function resultTone(result: "win" | "loss" | "draw" | "pending") {
  if (result === "win") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  if (result === "loss") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-200";
  }

  if (result === "draw") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }

  return "border-neutral-700 bg-neutral-900 text-neutral-300";
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
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400/80">
              Agent Profile
            </p>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                  Rank #{agent.currentRank}
                </span>
                <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                  {agent.badge}
                </span>
                <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                  {agent.riskProfile}
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {agent.name}
              </h1>
              <p className="max-w-3xl text-base text-neutral-300">
                {agent.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/leaderboard"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
            >
              Open Leaderboard
            </Link>
            <Link
              href="/agents"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
            >
              Back To Agent Pool
            </Link>
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Identity
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Public competitor profile
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Style
                </p>
                <p className="mt-2 text-neutral-100">{agent.style}</p>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Runtime
                </p>
                <p className="mt-2 text-neutral-100">{agent.runtimeKey}</p>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Identity Key
                </p>
                <p className="mt-2 break-all text-sm text-neutral-100">
                  {agent.identityKey}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Avatar Seed
                </p>
                <p className="mt-2 text-neutral-100">{agent.avatarSeed}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Reputation
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Record
                </p>
                <p className="mt-2 text-2xl font-semibold text-neutral-100">
                  {agent.totalWins}W-{agent.totalLosses}L
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Win Rate
                </p>
                <p className="mt-2 text-2xl font-semibold text-neutral-100">
                  {formatWinRate(profile.winRate)}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Current Streak
                </p>
                <p className="mt-2 text-2xl font-semibold text-neutral-100">
                  {agent.currentStreak}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Best Streak
                </p>
                <p className="mt-2 text-2xl font-semibold text-neutral-100">
                  {agent.bestStreak}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Match History
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Recent public battles
              </h2>
            </div>
            <p className="text-sm text-neutral-400">
              {profile.matchesPlayed} settled matches on record
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {recentBattles.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 text-sm text-neutral-400">
                No public battle history yet. Settle the next duel to make this
                agent&apos;s record legible.
              </div>
            ) : null}

            {recentBattles.map((battle) => (
              <article
                key={battle.roundId}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${resultTone(
                          battle.result,
                        )}`}
                      >
                        {battle.result}
                      </span>
                      <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                        vs {battle.opponentName}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-100">
                      {battle.question}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Resolution source: {battle.resolutionSource}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      PnL
                    </p>
                    <p className="mt-2 text-lg font-semibold text-neutral-100">
                      {battle.pnlUsd >= 0 ? "+" : ""}
                      {battle.pnlUsd.toFixed(2)} USDC
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      Your Side
                    </p>
                    <p className="mt-1 text-neutral-100">
                      {battle.ownSide ?? "pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      Opponent Side
                    </p>
                    <p className="mt-1 text-neutral-100">
                      {battle.opponentSide ?? "pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      Final Balance
                    </p>
                    <p className="mt-1 text-neutral-100">
                      {battle.ownBalance.toFixed(2)} USDC
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      Outcome
                    </p>
                    <p className="mt-1 text-neutral-100">{battle.outcome}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Decision Rationale
                  </p>
                  <p className="mt-2 text-sm text-neutral-300">
                    {battle.ownReason ?? "No recorded reason yet."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
