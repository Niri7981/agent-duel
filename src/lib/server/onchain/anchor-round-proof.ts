import { anchorBattleProof } from "@/lib/server/onchain/anchor-battle-proof";
import { getLocalnetConnection } from "@/lib/server/onchain/localnet-connection";
import { loadLocalnetAuthority } from "@/lib/server/onchain/localnet-authority";

export type AnchorRoundProofResult =
  | {
      ok: true;
      onchainProofAddress: string;
      onchainSignature: string;
      proofHash: string;
    }
  | {
      error: string;
      ok: false;
    };

export async function anchorRoundProof(
  roundId: string,
): Promise<AnchorRoundProofResult> {
  try {
    const connection = getLocalnetConnection();
    const authority = await loadLocalnetAuthority();
    const result = await anchorBattleProof({
      authority,
      commitment: "confirmed",
      connection,
      roundId,
    });

    return {
      ok: true,
      onchainProofAddress: result.onchainProofAddress,
      onchainSignature: result.onchainSignature,
      proofHash: result.proofHash,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to anchor battle proof on localnet.",
      ok: false,
    };
  }
}
