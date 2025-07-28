//

import { readdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import { $, argv, fs } from "zx";

//

$.verbose = true;

//

let testCase = argv._[0];

const doesExist = await fs.exists(`cypress/e2e/${testCase}`);

if (!testCase || !doesExist) {
  console.log(`Could not resolve test case "${testCase}"`);
  const availableTestCases = await readdir("cypress/e2e");
  console.log(
    `They are ${availableTestCases.length} test cases in the cypress/e2e folder :`,
  );
  console.log(
    availableTestCases.map((name, index) => `${index}) ${name}`).join("\n"),
  );
  console.log("Please select one of them:");

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  testCase = await new Promise((resolve) => {
    const prompt = () => {
      rl.question("Enter test case number (default=0): ", (input) => {
        const index = Number(input.trim());
        if (!isNaN(index) && availableTestCases[index]) {
          rl.close();
          resolve(availableTestCases[index]);
        } else {
          console.log("Invalid selection, try again");
          prompt();
        }
      });
    };

    prompt();
  });
  rl.close();
  console.log();
}

//

console.log(`🚥 Setup test "${testCase}" case`);
console.log();
await $`npm run build:workspaces`;

$`npx dotenvx run -f cypress/e2e/${testCase}/env.conf -- npm run dev`;
