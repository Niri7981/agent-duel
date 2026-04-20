import { RoundAction } from "@/lib/types/action";

export function ActionTimeline({ actions }: { actions: RoundAction[] }) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        Action Timeline
      </p>
      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">{action.agentName}</span>
              <span className="text-xs text-neutral-500">{action.at}</span>
            </div>
            <p className="mt-2 text-sm text-neutral-300">
              {action.side.toUpperCase()} {action.sizeUsd.toFixed(2)} USDC
            </p>
            <p className="mt-1 text-sm text-neutral-500">{action.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
