import { settleRoundOnchain } from "@/lib/solana/settlement";

async function main() {
  console.log(await settleRoundOnchain("round-demo-1"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
