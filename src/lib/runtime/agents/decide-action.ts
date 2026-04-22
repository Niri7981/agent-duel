import { runContrarianAgent } from "@/lib/runtime/agents/contrarian";
import { runMomentumAgent } from "@/lib/runtime/agents/momentum";
import type { AgentDecision } from "@/lib/runtime/agents/types";
import type { ArenaEvent } from "@/lib/types/event";

// 运行时层只关心“给定一个公共 agent 的 runtimeKey，该怎么产出标准化决策”。
// 这样后面无论底层是规则、LLM 还是混合策略，battle 层都只需要调这个统一入口。
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
