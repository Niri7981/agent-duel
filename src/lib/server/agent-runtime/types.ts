import type { AgentPoolRiskProfile } from "@/lib/server/agents/types";
import type { ArenaEvent } from "@/lib/types/event";

export type AgentRuntimeParticipant = {
  identityKey: string;
  name: string;
  riskProfile: AgentPoolRiskProfile;
  roundAgentId: string;
  runtimeKey: string;
  style: string;
};

export type AgentRuntimeDecisionInput = {
  agent: AgentRuntimeParticipant;
  bankrollUsd: number;
  currentPrice: number;
  event: ArenaEvent;
  opponents: AgentRuntimeParticipant[];
  roundId: string;
};

export type AgentRuntimeDecision = {
  identityKey: string;
  reason: string;
  roundAgentId: string;
  runtimeKey: string;
  side: "yes" | "no";
  sizeUsd: number;
};

export type AgentRuntimeRawDecision = Omit<
  AgentRuntimeDecision,
  "identityKey" | "roundAgentId" | "runtimeKey"
>;

export type AgentRuntimeAdapter = {
  decide(
    input: AgentRuntimeDecisionInput,
  ): AgentRuntimeRawDecision | Promise<AgentRuntimeRawDecision>;
  runtimeKey: string;
};
