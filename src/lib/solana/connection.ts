import { Connection, clusterApiUrl } from "@solana/web3.js";

export function getSolanaConnection() {
  return new Connection(clusterApiUrl("devnet"), "confirmed");
}
