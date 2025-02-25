//

import { findOrganisationBySiret } from "@gouvfr-lasuite/proconnect.entreprise/testing/msw";
import { setupServer } from "msw/node";
import { join } from "node:path";

//

export const server = setupServer(
  findOrganisationBySiret({
    snapshot_dir: join(import.meta.dirname, "./etablissements"),
  }),
);
