import {
  ActionTimeline,
  AgentCard,
  BankrollPanel,
  EventCard,
  RoundShell,
  SettlementResult,
} from "@/components";
import { getDemoRoundState } from "@/lib/engine/run-round";

export default function RoundPage() {
  const round = getDemoRoundState();

  return (
    <RoundShell>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="space-y-6">
          <EventCard event={round.event} />
          <div className="grid gap-4 md:grid-cols-2">
            {round.agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          <ActionTimeline actions={round.actions} />
        </section>

        <aside className="space-y-6">
          <BankrollPanel balances={round.balances} />
          <SettlementResult settlement={round.settlement} />
        </aside>
      </div>
    </RoundShell>
  );
}
