import { Core } from "./src/core.ts";

async function main() {
  const prompt = await (new Core()).start();
  console.log(prompt);
}

main();
