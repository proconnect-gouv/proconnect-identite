//

import { readdir } from "node:fs/promises";
import { $, argv, fs, sleep, type ProcessPromise } from "zx";

//

$.verbose = true;

const APP_URL = "http://localhost:3000/users/start-sign-in";
const LOGS_DIR = "cypress/logs";
const SERVER_READY_TIMEOUT_MS = 60_000;

//

const allTestCases = (await readdir("cypress/e2e")).sort();
const requestedTestCases = argv._.map(String);

const unknownTestCases = requestedTestCases.filter(
  (testCase) => !allTestCases.includes(testCase),
);
if (unknownTestCases.length > 0) {
  console.log(`Could not resolve test cases: ${unknownTestCases.join(", ")}`);
  process.exit(1);
}

const testCases =
  requestedTestCases.length > 0 ? requestedTestCases : allTestCases;

if (await isServerUp()) {
  console.log(
    `Something is already listening on ${APP_URL}. Stop it before running the e2e tests.`,
  );
  process.exit(1);
}

console.log(`🚥 Building the application`);
console.log();

await $`npm run build:workspaces`;
await $`npm run build:assets`;
await $`npm run migrate up`;
await fs.ensureDir(LOGS_DIR);

const results: { testCase: string; passed: boolean }[] = [];

for (const [index, testCase] of testCases.entries()) {
  console.log();
  console.log(`🚥 [${index + 1}/${testCases.length}] Running "${testCase}"`);
  console.log();

  results.push({ testCase, passed: await runTestCase(testCase) });
}

console.log();
console.log(`🚥 Summary`);
console.log();
for (const { testCase, passed } of results) {
  console.log(`${passed ? "✅" : "❌"} ${testCase}`);
}

const failures = results.filter(({ passed }) => !passed);
console.log();
console.log(
  `${results.length - failures.length}/${results.length} test cases passed`,
);
if (failures.length > 0) {
  console.log(`Server logs are available in ${LOGS_DIR}/<test_case>.log`);
}

process.exit(failures.length > 0 ? 1 : 0);

//

async function runTestCase(testCase: string) {
  const server = $({
    nothrow: true,
    quiet: true,
    env: { ...process.env, NODE_ENV: "development" },
  })`npx dotenvx run -f cypress/e2e/${testCase}/env.conf --overload -- npm run start`;
  server.pipe(fs.createWriteStream(`${LOGS_DIR}/${testCase}.log`));

  try {
    if (!(await waitForServer(server))) {
      console.log(
        `❌ Server did not start, see ${LOGS_DIR}/${testCase}.log for details`,
      );
      return false;
    }

    const cypress = await $({
      nothrow: true,
    })`npx dotenvx run -- npx cypress run --spec cypress/e2e/${testCase}/index.cy.ts`;

    return cypress.exitCode === 0;
  } finally {
    await server.kill().catch(() => {});
    await server;
    while (await isServerUp()) await sleep(200);
  }
}

async function waitForServer(server: ProcessPromise) {
  let hasExited = false;
  server.then(() => (hasExited = true));

  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS;
  while (Date.now() < deadline && !hasExited) {
    if (await isServerUp()) return true;
    await sleep(500);
  }
  return false;
}

async function isServerUp() {
  try {
    const response = await fetch(APP_URL);
    return response.ok;
  } catch {
    return false;
  }
}
