//

import { createContext } from "@proconnect-gouv/proconnect.identite/connectors";
import {
  ApiEntrepriseInfogreffeRepository,
  ApiEntrepriseInseeRepository,
} from "./api-entreprise";
import { InseeApiRepository } from "./api-insee";
import { RegistreNationalEntreprisesApiRepository } from "./api-rne";
import { getDatabaseConnection } from "./postgres";

//

export const context = createContext({
  api_entreprise_infogreffe_client: ApiEntrepriseInfogreffeRepository,
  api_entreprise_insee_client: ApiEntrepriseInseeRepository,
  api_insee_client: InseeApiRepository,
  api_registre_national_entreprises_client:
    RegistreNationalEntreprisesApiRepository,
  pg: getDatabaseConnection(),
});
