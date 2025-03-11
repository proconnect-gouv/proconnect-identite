//

import assert from "node:assert/strict";
import { getOrganizationInfo } from "../../src/connectors/api-sirene";
import { cleanup } from "../serve";

//

const siret = process.argv[2];
assert.ok(siret);
const organizationInfo = await getOrganizationInfo(siret);
assert.equal(organizationInfo.siret, siret);
// NOTE(douglasduteil): warn of not diffusible organizations
// As the mocked json files can content sensible data, we do not want to
// commit them to the repository. Here is a little warning to help you
// to check the data you are using.
assert.equal(organizationInfo.statutDiffusion, "diffusible");

cleanup();
