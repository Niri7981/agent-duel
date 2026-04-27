import {
  type Connection,
  type Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { prisma } from "@/lib/db/prisma";
import { buildRecordBattleProofInstruction } from "../../../../onchain/clients/arena";
import type { BattleProofPayload } from "@/lib/server/battles/types";

import { buildBattleProofAnchorInput } from "./build-battle-proof-anchor-input";

export type AnchorBattleProofResult = {
  anchoredAt: Date;
  onchainProofAddress: string;
  onchainSignature: string;
  proofHash: string;
  roundId: string;
};

export type AnchorBattleProofInput = {
  authority: Keypair;
  commitment?: "processed" | "confirmed" | "finalized";
  connection: Connection;
  roundId: string;
};

// 这里在干嘛：
// 把一条已经落库的 BattleProofRecord 发送到 Solana，记录 compact proof anchor。
// 为什么这么写：
// DB transaction 负责 settlement 和 proof payload；链上交易放在独立服务里，避免结算事务被 RPC/签名状态拖住。
// 最后返回什么：
// 返回链上 proof PDA、交易签名和回写时间。
export async function anchorBattleProof(
  input: AnchorBattleProofInput,
): Promise<AnchorBattleProofResult> {
  const record = await prisma.battleProofRecord.findUnique({
    where: {
      roundId: input.roundId,
    },
  });

  if (!record) {
    throw new Error(`No BattleProofRecord found for round ${input.roundId}.`);
  }

  if (record.onchainSignature) {
    return {
      anchoredAt: record.anchoredAt ?? record.updatedAt,
      onchainProofAddress: record.onchainProofAddress ?? "",
      onchainSignature: record.onchainSignature,
      proofHash: record.proofHash,
      roundId: record.roundId,
    };
  }

  const payload = JSON.parse(record.payload) as BattleProofPayload;
  const proofInput = buildBattleProofAnchorInput({
    authority: input.authority.publicKey,
    payload,
    record,
  });
  const { instruction, proofAddress } =
    buildRecordBattleProofInstruction(proofInput);
  const latestBlockhash = await input.connection.getLatestBlockhash(
    input.commitment ?? "confirmed",
  );
  const transaction = new Transaction({
    blockhash: latestBlockhash.blockhash,
    feePayer: input.authority.publicKey,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }).add(instruction);
  const signature = await sendAndConfirmTransaction(
    input.connection,
    transaction,
    [input.authority],
    {
      commitment: input.commitment ?? "confirmed",
    },
  );
  const anchoredAt = new Date();
  const onchainProofAddress = proofAddress.toBase58();

  await prisma.battleProofRecord.update({
    data: {
      anchoredAt,
      onchainProofAddress,
      onchainSignature: signature,
    },
    where: {
      roundId: input.roundId,
    },
  });

  return {
    anchoredAt,
    onchainProofAddress,
    onchainSignature: signature,
    proofHash: record.proofHash,
    roundId: record.roundId,
  };
}
