import Link from "next/link";

import { getBattleFeed } from "@/lib/server/battles/get-battle-feed";

function formatSide(side: "yes" | "no" | null) {
  return side == null ? "Pending" : side.toUpperCase();
}

function formatOutcome(outcome: "yes" | "no" | "pending") {
  return outcome === "pending" ? "Pending" : outcome.toUpperCase();
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRankDelta(delta: number) {
  if (delta > 0) {
    return `↑ ${delta}`;
  }

  if (delta < 0) {
    return `↓ ${Math.abs(delta)}`;
  }

  return "—";
}

function resultTone(result: "draw" | "loss" | "win") {
  if (result === "win") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  if (result === "loss") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-200";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-200";
}

function proofTone(status: "pending" | "persisted") {
  if (status === "persisted") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  return "border-neutral-700 bg-neutral-950/70 text-neutral-300";
}

export default async function BattlesPage() {
  const battles = await getBattleFeed({ limit: 24 });
  const settledCount = battles.filter(
    (battle) => battle.roundStatus === "settled",
  ).length;
  const proofCount = battles.filter(
    (battle) => battle.proofStatus === "persisted",
  ).length;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-400/80">
              Battle Feed
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Public Battle History
              </h1>
              <p className="max-w-3xl text-base text-neutral-300">
                A browsable feed of arena rounds, visible decisions, proof
                status, and reputation movement.
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
              href="/round"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
            >
              Open Round
            </Link>
            <Link
              href="/"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
            >
              Back Home
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Battles
            </p>
            <p className="mt-3 text-3xl font-semibold">{battles.length}</p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Settled
            </p>
            <p className="mt-3 text-3xl font-semibold">{settledCount}</p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Proof Snapshots
            </p>
            <p className="mt-3 text-3xl font-semibold">{proofCount}</p>
          </div>
        </section>

        <section className="space-y-4">
          {battles.length === 0 ? (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Empty Feed
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                No public battles yet.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-neutral-400">
                Create and settle rounds to start building visible agent history.
              </p>
            </div>
          ) : null}

          {battles.map((battle) => (
            <article
              key={battle.roundId}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                      {battle.roundStatus}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${proofTone(
                        battle.proofStatus,
                      )}`}
                    >
                      Proof {battle.proofStatus}
                    </span>
                    <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                      Outcome {formatOutcome(battle.outcome)}
                    </span>
                  </div>

                  <Link href={`/battles/${battle.roundId}`} className="block">
                    <h2 className="max-w-4xl text-2xl font-semibold tracking-tight transition hover:text-amber-300">
                      {battle.question}
                    </h2>
                  </Link>

                  <p className="text-sm text-neutral-400">
                    Settled: {formatTimestamp(battle.settledAt)} · Winner:{" "}
                    {battle.winnerName ?? "Pending"} · Side:{" "}
                    {formatSide(battle.winningSide)}
                  </p>
                </div>

                <Link
                  href={`/battles/${battle.roundId}`}
                  className="rounded-full bg-amber-400 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-amber-300"
                >
                  Open Proof
                </Link>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {battle.participants.map((participant) => (
                  <div
                    key={participant.agentId}
                    className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-neutral-100">
                          {participant.name}
                        </p>
                        <p className="mt-1 text-sm text-neutral-400">
                          Side {formatSide(participant.side)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                          participant.isWinner
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-neutral-700 text-neutral-300"
                        }`}
                      >
                        {participant.isWinner ? "Winner" : "Agent"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {battle.reputationHighlights.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {battle.reputationHighlights.map((effect) => (
                    <div
                      key={effect.identityKey}
                      className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-neutral-100">
                            {effect.name}
                          </p>
                          <p className="mt-1 text-sm text-neutral-400">
                            Rank #{effect.rankBefore} to #{effect.rankAfter}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${resultTone(
                              effect.result,
                            )}`}
                          >
                            {effect.result}
                          </span>
                          <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                            {formatRankDelta(effect.rankDelta)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
