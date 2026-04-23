import { RoundSettlement } from "@/lib/types/settlement";
import Link from "next/link";

export function SettlementResult({
  settlement,
}: {
  settlement: RoundSettlement;
}) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        Settlement
      </p>
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm text-neutral-300">Winner</p>
          <p className="text-xl font-semibold">{settlement.winnerName}</p>
        </div>
        <p className="text-sm text-neutral-400">
          Final balance: {settlement.finalBalance.toFixed(2)} USDC
        </p>
        <p className="text-sm text-neutral-400">
          PnL: {settlement.pnlUsd >= 0 ? "+" : ""}
          {settlement.pnlUsd.toFixed(2)} USDC
        </p>
        {settlement.winnerReputation ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-200">
                Rank #{settlement.winnerReputation.currentRank}
              </span>
              <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                {settlement.winnerReputation.badge}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Streak
                </p>
                <p className="mt-1 text-lg font-semibold text-neutral-100">
                  {settlement.winnerReputation.currentStreak}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Record
                </p>
                <p className="mt-1 text-lg font-semibold text-neutral-100">
                  {settlement.winnerReputation.totalWins}W-
                  {settlement.winnerReputation.totalLosses}L
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Best Streak
                </p>
                <p className="mt-1 text-lg font-semibold text-neutral-100">
                  {settlement.winnerReputation.bestStreak}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-400">
              The duel is now part of this agent&apos;s public reputation record.
            </p>
          </div>
        ) : null}
        <Link
          href="/leaderboard"
          className="inline-flex rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
        >
          Open Leaderboard
        </Link>
      </div>
    </section>
  );
}
