import { AgentDecision, AgentDecisionInput } from "@/lib/agents/types";

export function runContrarianAgent(
  input: AgentDecisionInput,
): AgentDecision {
  return {
    side: input.currentPrice >= 0.5 ? "no" : "yes",
    sizeUsd: Math.min(3, input.bankrollUsd * 0.3),
    reason: "Takes the opposite side when consensus looks crowded.",
  };
}
