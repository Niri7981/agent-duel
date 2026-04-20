import { ArenaEvent } from "@/lib/types/event";

export type AgentDecisionInput = {
  event: ArenaEvent;
  currentPrice: number;
  bankrollUsd: number;
};

export type AgentDecision = {
  side: "yes" | "no";
  sizeUsd: number;
  reason: string;
};
