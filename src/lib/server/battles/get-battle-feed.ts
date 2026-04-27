import { getBattleProof } from "./get-battle-proof";
import { getBattleHistory } from "./get-battle-history";
import type { BattleRecord, BattleStatus } from "./types";

type GetBattleFeedInput = {
  limit?: number;
  status?: BattleStatus;
};

export type BattleFeedParticipant = {
  agentId: string;
  name: string;
  side: "yes" | "no" | null;
  pnlUsd: number;
  isWinner: boolean;
};

export type BattleFeedReputationHighlight = {
  identityKey: string;
  name: string;
  result: "win" | "loss" | "draw";
  rankBefore: number;
  rankAfter: number;
  rankDelta: number;
  streakBefore: number;
  streakAfter: number;
};

export type BattleFeedItem = {
  roundId: string;
  roundStatus: BattleRecord["roundStatus"];
  question: string;
  marketSymbol: string;
  outcome: BattleRecord["outcome"];
  createdAt: string;
  settledAt: string | null;
  winnerIdentityKey: string | null;
  winnerName: string | null;
  winningSide: "yes" | "no" | null;
  proofStatus: "pending" | "persisted";
  participants: BattleFeedParticipant[];
  reputationHighlights: BattleFeedReputationHighlight[];
};

// 这里在干嘛：
// 把通用 BattleRecord 和可选 proof snapshot，整理成 battle feed 更好消费的条目。
// 为什么这么写：
// 未来前端的 battle feed 更关心“谁赢了、身份怎么动了、proof 是否已经固化”，
// 不应该每个页面都自己理解完整 BattleRecord 和 BattleProofPayload。
// 最后返回什么：
// 返回一条适合列表、主舞台动态流、battle history 页面复用的 BattleFeedItem。
async function mapBattleRecordToFeedItem(
  battle: BattleRecord,
): Promise<BattleFeedItem> {
  const proof = await getBattleProof(battle.roundId);

  return {
    createdAt: battle.createdAt,
    marketSymbol: battle.marketSymbol,
    outcome: battle.outcome,
    participants: battle.participants.map((participant) => ({
      agentId: participant.agentId,
      isWinner: participant.isWinner,
      name: participant.name,
      pnlUsd: participant.pnlUsd,
      side: participant.side,
    })),
    proofStatus: proof ? "persisted" : "pending",
    question: battle.question,
    reputationHighlights:
      proof?.reputationEffects.map((effect) => ({
        identityKey: effect.identityKey,
        name: effect.name,
        rankAfter: effect.rankAfter,
        rankBefore: effect.rankBefore,
        rankDelta: effect.rankDelta,
        result: effect.result,
        streakAfter: effect.streakAfter,
        streakBefore: effect.streakBefore,
      })) ?? [],
    roundId: battle.roundId,
    roundStatus: battle.roundStatus,
    settledAt: battle.settledAt,
    winnerIdentityKey: battle.winningAgentId,
    winnerName: battle.winningAgentName,
    winningSide: battle.winningSide,
  };
}

// 这里在干嘛：
// 读取公开 battle feed，供 arena 首页和 battle history 页面使用。
// 为什么这么写：
// BattleRecord 是后端标准记录；BattleFeedItem 是观众前端标准记录。
// 这一层把 proof 状态和 reputation movement 提前拼好，降低大前端页面复杂度。
// 最后返回什么：
// 返回按时间倒序排列的 BattleFeedItem 数组。
export async function getBattleFeed(input: GetBattleFeedInput = {}) {
  const battles = await getBattleHistory({
    limit: input.limit,
    status: input.status,
  });

  return Promise.all(battles.map((battle) => mapBattleRecordToFeedItem(battle)));
}
