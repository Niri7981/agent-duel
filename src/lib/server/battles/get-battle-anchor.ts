import { prisma } from "@/lib/db/prisma";
import {
  buildLocalnetExplorerUrl,
  getLocalnetConnection,
} from "@/lib/server/onchain/localnet-connection";
import type { BattleProofPayload } from "@/lib/server/battles/types";
import {
  ARENA_PROGRAM_ID,
  decodeBattleProofAnchor,
  deriveBattleProofPda,
  type RecordBattleProofWinningSide,
} from "../../../../onchain/clients/arena";

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
  verified: boolean;
  verificationError: string | null;
  verificationStatus: "missing" | "mismatch" | "pending" | "verified";
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

function normalizeWinningSide(
  winningSide: BattleProofPayload["winningSide"],
): RecordBattleProofWinningSide {
  if (winningSide === "yes" || winningSide === "no") {
    return winningSide;
  }

  return "none";
}

function settledAtUnix(payload: BattleProofPayload) {
  if (!payload.settledAt) {
    return null;
  }

  const value = new Date(payload.settledAt).getTime();

  return Number.isNaN(value) ? null : Math.floor(value / 1000);
}

function assertBytesEqual(
  actual: Uint8Array,
  expected: Uint8Array,
  fieldName: string,
) {
  if (actual.length !== expected.length) {
    throw new Error(`${fieldName} length mismatch.`);
  }

  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index] !== expected[index]) {
      throw new Error(`${fieldName} mismatch.`);
    }
  }
}

async function verifyProofAnchorAccount(record: {
  onchainProofAddress: string | null;
  proofHash: string;
  proofVersion: number;
  payload: string;
  roundId: string;
}) {
  if (!record.onchainProofAddress) {
    return {
      error: null,
      status: "pending" as const,
    };
  }

  try {
    const payload = JSON.parse(record.payload) as BattleProofPayload;
    const expectedPda = deriveBattleProofPda(record.roundId, ARENA_PROGRAM_ID);
    const connection = getLocalnetConnection();
    const account = await connection
      .getAccountInfo(expectedPda.proofAddress)
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Localnet RPC is unavailable.";

        return {
          error: `Localnet RPC unavailable: ${message}`,
          pending: true,
        } as const;
      });

    if (account && "pending" in account) {
      return {
        error: account.error,
        status: "pending" as const,
      };
    }

    if (!account) {
      return {
        error: "Proof PDA account not found on localnet.",
        status: "missing" as const,
      };
    }

    if (!account.owner.equals(ARENA_PROGRAM_ID)) {
      throw new Error("Proof PDA owner is not the AgentDuel arena program.");
    }

    if (record.onchainProofAddress !== expectedPda.proofAddress.toBase58()) {
      throw new Error("Stored proof PDA does not match derived proof PDA.");
    }

    const decoded = decodeBattleProofAnchor(account.data);
    const expectedSettledAtUnix = settledAtUnix(payload);

    assertBytesEqual(
      decoded.roundIdSeed,
      expectedPda.roundIdSeed,
      "round id seed",
    );

    if (decoded.roundId !== record.roundId) {
      throw new Error("Onchain round id does not match battle proof record.");
    }

    if (decoded.proofHash !== record.proofHash) {
      throw new Error("Onchain proof hash does not match battle proof record.");
    }

    if (decoded.proofVersion !== record.proofVersion) {
      throw new Error(
        "Onchain proof version does not match battle proof record.",
      );
    }

    if (decoded.winningSide !== normalizeWinningSide(payload.winningSide)) {
      throw new Error("Onchain winning side does not match proof payload.");
    }

    if (decoded.winnerIdentityKey !== payload.winnerIdentityKey) {
      throw new Error(
        "Onchain winner identity does not match proof payload.",
      );
    }

    if (
      expectedSettledAtUnix == null ||
      decoded.settledAtUnix !== expectedSettledAtUnix
    ) {
      throw new Error("Onchain settlement timestamp does not match payload.");
    }

    return {
      error: null,
      status: "verified" as const,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to verify battle proof PDA.",
      status: "mismatch" as const,
    };
  }
}

// 这里在干嘛：
// 读一场 round 的链上 anchor 视图。
// 为什么这么写：
// /api/battles/[roundId]/proof 和 /battles/[roundId] 详情页都需要同一份链上字段；
// 把它收敛在一个 helper 里，保证两侧字段含义不会漂移。
// 这里还会读取 proof PDA 并验证其内容，避免 UI 只相信数据库里的一条 signature。
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
      payload: true,
      proofHash: true,
      proofHashEncoding: true,
      proofVersion: true,
      roundId: true,
    },
    where: {
      roundId,
    },
  });

  if (!record) {
    return null;
  }

  const [slot, verification] = await Promise.all([
    readSignatureSlot(record.onchainSignature),
    verifyProofAnchorAccount(record),
  ]);

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
    verificationError: verification.error,
    verificationStatus: verification.status,
    verified: verification.status === "verified",
  };
}
