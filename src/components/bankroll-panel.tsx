import { BankrollBalance } from "@/lib/types/round";

export function BankrollPanel({
  balances,
}: {
  balances: BankrollBalance[];
}) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        Bankroll
      </p>
      <div className="mt-4 space-y-3">
        {balances.map((balance) => (
          <div
            key={balance.agentId}
            className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3"
          >
            <span className="text-sm text-neutral-300">{balance.agentName}</span>
            <span className="font-medium">{balance.usdc.toFixed(2)} USDC</span>
          </div>
        ))}
      </div>
    </section>
  );
}
