import { AgentDecision, AgentDecisionInput } from "@/lib/agents/types";

export function runMomentumAgent(
  input: AgentDecisionInput,
): AgentDecision {
  return {
    side: input.currentPrice >= 0.5 ? "yes" : "no",
    sizeUsd: Math.min(4, input.bankrollUsd * 0.4),
    reason: "Follows the current market direction with controlled size.",
  };
}
