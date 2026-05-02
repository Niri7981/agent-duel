import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";

import { ARENA_PROGRAM_ID } from "./constants";
import { deriveBattleProofPda } from "./derive-battle-proof-pda";
import { encodeRecordBattleProofInstructionData } from "./encode-record-battle-proof";
import type { BattleProofPda, RecordBattleProofInput } from "./types";

export type BuildRecordBattleProofInstructionResult = BattleProofPda & {
  instruction: TransactionInstruction;
};

// 这里在干嘛：
// 构造 record_battle_proof 的 Solana instruction。
// 为什么这么写：
// 交易发送、签名和重试策略属于后端 job；这个 helper 只负责稳定生成 accounts 和 data。
// 最后返回什么：
// 返回 TransactionInstruction，以及调用方需要回写 DB 的 proof PDA 信息。
export function buildRecordBattleProofInstruction(
  input: RecordBattleProofInput,
  programId: PublicKey = ARENA_PROGRAM_ID,
): BuildRecordBattleProofInstructionResult {
  const proofPda = deriveBattleProofPda(input.roundId, programId);
  const data = encodeRecordBattleProofInstructionData({
    ...input,
    roundIdSeed: proofPda.roundIdSeed,
  });

  return {
    ...proofPda,
    instruction: new TransactionInstruction({
      data,
      keys: [
        {
          isSigner: true,
          isWritable: true,
          pubkey: input.authority,
        },
        {
          isSigner: false,
          isWritable: true,
          pubkey: proofPda.proofAddress,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: SystemProgram.programId,
        },
      ],
      programId,
    }),
  };
}
