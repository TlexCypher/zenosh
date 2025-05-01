import { Core } from "./src/core/core.ts";

async function main() {
  const prompt = await (new Core()).start();
  console.log(prompt);
}

main();
