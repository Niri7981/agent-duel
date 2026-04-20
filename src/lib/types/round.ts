import { RoundAction } from "@/lib/types/action";
import { AgentSummary } from "@/lib/types/agent";
import { ArenaEvent } from "@/lib/types/event";
import { RoundSettlement } from "@/lib/types/settlement";

export type BankrollBalance = {
  agentId: string;
  agentName: string;
  usdc: number;
};

export type RoundState = {
  id: string;
  status: "live" | "settled";
  bankrollPerAgent: number;
  event: ArenaEvent;
  agents: AgentSummary[];
  actions: RoundAction[];
  balances: BankrollBalance[];
  settlement: RoundSettlement;
};
