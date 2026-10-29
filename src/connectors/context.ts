//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { createContext } from "@proconnect-gouv/proconnect.identite/connectors";
import { drizzle } from "drizzle-orm/node-postgres";
import { ApiEntrepriseClient } from "./api-entreprise";
import { ApiInseeClient } from "./api-insee";
import { ApiRegistreNationalEntreprisesClient } from "./api-rne";
import { getDatabaseConnection } from "./postgres";

//

export const context = createContext({
  api_entreprise_client: ApiEntrepriseClient,
  api_insee_client: ApiInseeClient,
  api_registre_national_entreprises_client:
    ApiRegistreNationalEntreprisesClient,
  pg: getDatabaseConnection(),
});

export const runtime = createIdentiteRuntime({
  db: drizzle(getDatabaseConnection(), { schema }),
});
