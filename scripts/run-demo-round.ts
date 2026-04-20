import { getDemoRoundState } from "@/lib/engine/run-round";

async function main() {
  console.log(JSON.stringify(getDemoRoundState(), null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
