import { runTourismAgent } from "./agents/parent.js";

const input = process.argv.slice(2).join(" ").trim();
if (!input) {
  process.stdout.write("Provide an input, e.g. \"I’m going to go to Bangalore, let’s plan my trip.\"\n");
  process.exit(0);
}
runTourismAgent(input).then((out) => {
  process.stdout.write(out + "\n");
}).catch((e) => {
  process.stdout.write("Unexpected error\n");
  process.exit(1);
});