//

import { $, argv, fs } from "zx";

//

$.verbose = true;

//

let testCase = argv._[0];

const doesExist = await fs.exists(`cypress/e2e/${testCase}`);

if (doesExist)
  $`npx dotenvx run -- npx cypress run --headed --spec "cypress/e2e/${testCase}/index.cy.ts"`;
else console.log(`Could not resolve test case "${testCase}"`);
