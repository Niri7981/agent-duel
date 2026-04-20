import { AgentSummary } from "@/lib/types/agent";

export function AgentCard({ agent }: { agent: AgentSummary }) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{agent.name}</p>
          <p className="mt-1 text-sm text-neutral-400">{agent.style}</p>
        </div>
        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
          {agent.riskProfile}
        </span>
      </div>
    </section>
  );
}
