import { prisma } from "@/lib/db/prisma";
import {
  buildLocalnetExplorerUrl,
  getLocalnetConnection,
} from "@/lib/server/onchain/localnet-connection";

// BattleAnchorView 是给 API / 页面共用的链上锚定视图。
// 它把数据库里的 BattleProofRecord 字段、explorer URL 和 RPC 实时回执拼成统一形状。
// 没有锚定时所有可空字段都是 null，UI 不需要再判断字段名差异。
export type BattleAnchorView = {
  anchoredAt: string | null;
  explorerUrl: string | null;
  network: "localnet";
  onchainProofAddress: string | null;
  onchainSignature: string | null;
  proofHash: string | null;
  proofHashEncoding: string;
  proofVersion: number | null;
  slot: number | null;
};

// 这里在干嘛：
// 在 RPC 上读一笔交易的 slot，作为 anchor 是否真的被链确认的额外信号。
// 为什么这么写：
// 应用层只信任落库的 signature 不一定够；从链回查一次能避免 UI 显示一条根本未确认的交易。
// 最后返回什么：
// 找到 status 时返回 slot；本地链关掉、RPC 报错或交易不存在时返回 null。
async function readSignatureSlot(signature: string | null) {
  if (!signature) {
    return null;
  }

  try {
    const connection = getLocalnetConnection();
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });

    return status.value?.slot ?? null;
  } catch {
    return null;
  }
}

// 这里在干嘛：
// 读一场 round 的链上 anchor 视图。
// 为什么这么写：
// /api/battles/[roundId]/proof 和 /battles/[roundId] 详情页都需要同一份链上字段；
// 把它收敛在一个 helper 里，保证两侧字段含义不会漂移。
// 最后返回什么：
// 找到 BattleProofRecord 时返回 BattleAnchorView；找不到时返回 null。
export async function getBattleAnchor(
  roundId: string,
): Promise<BattleAnchorView | null> {
  const record = await prisma.battleProofRecord.findUnique({
    select: {
      anchoredAt: true,
      onchainProofAddress: true,
      onchainSignature: true,
      proofHash: true,
      proofHashEncoding: true,
      proofVersion: true,
    },
    where: {
      roundId,
    },
  });

  if (!record) {
    return null;
  }

  const slot = await readSignatureSlot(record.onchainSignature);

  return {
    anchoredAt: record.anchoredAt?.toISOString() ?? null,
    explorerUrl: record.onchainSignature
      ? buildLocalnetExplorerUrl(record.onchainSignature)
      : null,
    network: "localnet",
    onchainProofAddress: record.onchainProofAddress,
    onchainSignature: record.onchainSignature,
    proofHash: record.proofHash,
    proofHashEncoding: record.proofHashEncoding,
    proofVersion: record.proofVersion,
    slot,
  };
}
