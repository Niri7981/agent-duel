import { RoundAction } from "@/lib/types/action";

export function getDemoTimeline(): RoundAction[] {
  return [
    {
      id: "action-1",
      agentId: "momentum",
      agentName: "Momentum Agent",
      side: "yes",
      sizeUsd: 4,
      at: "00:30",
      reason: "Price moved above 0.50 and momentum stayed positive.",
    },
    {
      id: "action-2",
      agentId: "contrarian",
      agentName: "Contrarian Agent",
      side: "no",
      sizeUsd: 3,
      at: "02:10",
      reason: "Consensus looked crowded, so it faded the move.",
    },
  ];
}
