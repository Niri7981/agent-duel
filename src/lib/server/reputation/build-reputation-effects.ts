import type {
  ReputationEffect,
  ReputationProfileSnapshot,
  ReputationResult,
} from "./types";

// 这里在干嘛：
// 把 settlement 前后的 agent reputation 快照，翻译成一条可证明的 reputation effect。
// 为什么这么写：
// reputation effect 是 AgentDuel 身份层的历史变化记录，
// proof、battle feed、未来 onchain anchor 都应该复用同一种计算方式。
// 最后返回什么：
// 返回一条 ReputationEffect。
function buildReputationEffect(params: {
  after: ReputationProfileSnapshot;
  before: ReputationProfileSnapshot;
  result: ReputationResult;
}): ReputationEffect {
  return {
    bestStreakAfter: params.after.bestStreak,
    bestStreakBefore: params.before.bestStreak,
    identityKey: params.after.identityKey,
    lossesAfter: params.after.totalLosses,
    lossesBefore: params.before.totalLosses,
    name: params.after.name,
    rankAfter: params.after.currentRank,
    rankBefore: params.before.currentRank,
    rankDelta: params.before.currentRank - params.after.currentRank,
    result: params.result,
    streakAfter: params.after.currentStreak,
    streakBefore: params.before.currentStreak,
    winsAfter: params.after.totalWins,
    winsBefore: params.before.totalWins,
  };
}

// 这里在干嘛：
// 为一场 battle 生成所有参赛 agent 的 reputation effect。
// 为什么这么写：
// battle proof 不应该自己理解 wins、losses、rank、streak 的 before/after 规则；
// 这些属于 reputation 层，集中在这里可以避免后续多处漂移。
// 最后返回什么：
// 返回按参赛 identityKey 顺序排列的 ReputationEffect 数组。
export function buildBattleReputationEffects(params: {
  afterProfiles: ReputationProfileSnapshot[];
  beforeProfiles: ReputationProfileSnapshot[];
  participantIdentityKeys: string[];
  winnerIdentityKey: string | null;
}): ReputationEffect[] {
  const beforeProfiles = new Map(
    params.beforeProfiles.map((profile) => [profile.identityKey, profile]),
  );
  const afterProfiles = new Map(
    params.afterProfiles.map((profile) => [profile.identityKey, profile]),
  );

  return params.participantIdentityKeys.map((identityKey) => {
    const before = beforeProfiles.get(identityKey);
    const after = afterProfiles.get(identityKey);

    if (!before || !after) {
      throw new Error(
        `Missing reputation snapshot while building effect for ${identityKey}.`,
      );
    }

    return buildReputationEffect({
      after,
      before,
      result:
        params.winnerIdentityKey == null
          ? "draw"
          : params.winnerIdentityKey === identityKey
            ? "win"
            : "loss",
    });
  });
}
