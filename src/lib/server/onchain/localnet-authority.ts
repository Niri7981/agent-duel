import { Keypair } from "@solana/web3.js";

async function resolveAuthorityPath() {
  const { homedir } = await import("node:os");

  return (
    process.env.SOLANA_AUTHORITY_KEYPAIR_PATH ??
    process.env.ANCHOR_WALLET ??
    `${homedir()}/.config/solana/id.json`
  );
}

export async function loadLocalnetAuthority() {
  const { readFile } = await import("node:fs/promises");
  const keypairPath = await resolveAuthorityPath();
  const rawKeypair = await readFile(
    /* turbopackIgnore: true */ keypairPath,
    "utf8",
  );
  const secretKey = Uint8Array.from(JSON.parse(rawKeypair) as number[]);

  return Keypair.fromSecretKey(secretKey);
}
