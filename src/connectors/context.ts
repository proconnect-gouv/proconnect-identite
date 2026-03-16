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
  api_entreprise_infogreffe_repository: ApiEntrepriseInfogreffeRepository,
  api_entreprise_insee_repository: ApiEntrepriseInseeRepository,
  api_insee_repository: InseeApiRepository,
  api_registre_national_entreprises_repository:
    RegistreNationalEntreprisesApiRepository,
  pg: getDatabaseConnection(),
});
