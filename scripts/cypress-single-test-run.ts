//

import { $, argv, fs } from "zx";

//

$.verbose = true;

//

let testCase = argv._[0];

const doesExist = await fs.exists(`cypress/e2e/${testCase}`);

if (!doesExist) {
  console.log(`Could not resolve test case "${testCase}"`);
  process.exit(1);
}

$`npx dotenvx run -- npx cypress run --headed --spec "cypress/e2e/${testCase}/index.cy.ts"`;
