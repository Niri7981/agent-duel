import { Connection } from "@solana/web3.js";

export const LOCALNET_RPC_URL =
  process.env.SOLANA_LOCALNET_RPC_URL ?? "http://127.0.0.1:8899";

export function getLocalnetConnection() {
  return new Connection(LOCALNET_RPC_URL, "confirmed");
}

export function buildLocalnetExplorerUrl(signature: string) {
  const encodedRpcUrl = encodeURIComponent(LOCALNET_RPC_URL);

  return `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${encodedRpcUrl}`;
}
