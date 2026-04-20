export type ArenaEvent = {
  id: string;
  question: string;
  resolutionSource: string;
  outcome: "yes" | "no" | "pending";
};
