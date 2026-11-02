//

import type { ApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { ApiInseeClient } from "@proconnect-gouv/proconnect.insee/api";
import type { ApiRegistreNationalEntreprisesClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";

//

export type Context = {
  client: {
    api_entreprise: ApiEntrepriseClient;
    insee: ApiInseeClient;
    rne: ApiRegistreNationalEntreprisesClient;
  };
};
