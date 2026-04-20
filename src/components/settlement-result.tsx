import { RoundSettlement } from "@/lib/types/settlement";

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
      </div>
    </section>
  );
}
