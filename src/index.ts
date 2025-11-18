import { createApp } from "./app";

async function main() {
  await createApp();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
