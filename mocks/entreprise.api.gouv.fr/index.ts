//

import { findOrganisationBySiret } from "@gouvfr-lasuite/proconnect.entreprise/testing/msw";
import { join } from "node:path";

//

export const entrepriseHandlers = [
  findOrganisationBySiret({
    snapshot_dir: join(import.meta.dirname, "./etablissements"),
  }),
];
