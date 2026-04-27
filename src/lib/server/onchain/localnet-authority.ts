import { readFile } from "node:fs/promises";
import { homedir } from "node:os";

import { Keypair } from "@solana/web3.js";

function resolveAuthorityPath() {
  return (
    process.env.SOLANA_AUTHORITY_KEYPAIR_PATH ??
    process.env.ANCHOR_WALLET ??
    `${homedir()}/.config/solana/id.json`
  );
}

export async function loadLocalnetAuthority() {
  const keypairPath = resolveAuthorityPath();
  const rawKeypair = await readFile(keypairPath, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(rawKeypair) as number[]);

  return Keypair.fromSecretKey(secretKey);
}
