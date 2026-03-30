//

import { createContext } from "@proconnect-gouv/proconnect.identite/connectors";
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
