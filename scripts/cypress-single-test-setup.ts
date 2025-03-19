//

import { readdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import { $, argv, fs } from "zx";

//

$.verbose = true;

//

let testCase = argv._[0];
const mode = argv.dev ? "development" : "single";
const interactive = !process.env.CI;

const doesExist = await fs.exists(`cypress/e2e/${testCase}`);

if (interactive && (!testCase || !doesExist)) {
  console.log(`Could not resolve test case "${testCase}"`);
  const availableTestCases = await readdir("cypress/e2e");
  console.log(
    `They are ${availableTestCases.length} test cases in the cypress/e2e folder :`,
  );
  console.log(
    availableTestCases.map((name, index) => `${index}) ${name}`).join("\t"),
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

console.log("🚥 Setup test case", testCase);
console.log();
await $`npm run build:workspaces`;
await $({ nothrow: true })`npm run delete-database`;
await $`npm run migrate up`;
await $`npm run fixtures:load-ci cypress/e2e/${testCase}/fixtures.sql`;
await $`npm run update-organization-info 0`;

console.log();
console.log("All set and ready !");

if (mode === "development") {
  $`npx dotenvx run -f cypress/e2e/${testCase}/env.conf -- npm run dev:with-mocks`;
} else {
  console.log("Run the app with the specific env vars:");

  console.log(`
  \t\`\`\`bash
  \tnpx dotenvx run -f cypress/e2e/${testCase}/env.conf -- npm run dev:with-mocks
  \t\`\`\`
  `);
}
