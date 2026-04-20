import { runContrarianAgent } from "@/lib/agents/contrarian";
import { runMomentumAgent } from "@/lib/agents/momentum";
import { AgentDecision } from "@/lib/agents/types";
import { ArenaEvent } from "@/lib/types/event";

export function decideAction(params: {
  agentId: string;
  event: ArenaEvent;
  bankrollUsd: number;
  currentPrice: number;
}): AgentDecision {
  if (params.agentId === "momentum") {
    return runMomentumAgent({
      event: params.event,
      bankrollUsd: params.bankrollUsd,
      currentPrice: params.currentPrice,
    });
  }

  return runContrarianAgent({
    event: params.event,
    bankrollUsd: params.bankrollUsd,
    currentPrice: params.currentPrice,
  });
}
