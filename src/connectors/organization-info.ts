//

import { getOrganizationInfoFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { logger } from "../services/log";
import { ApiEntrepriseClient } from "./api-entreprise";
import { ApiRegistreNationalEntreprisesClient } from "./api-rne";

const StubApiRegistreNationalEntreprisesClient = {
  findPouvoirsBySiren: ApiRegistreNationalEntreprisesClient.findPouvoirsBySiren,
  findCompanyBySiren: (siren: string) => {
    logger.info(
      `No call was made to the RNE API for this organization (${siren}); returning empty data.`,
    );
    return Promise.resolve({});
  },
};

//

export const getOrganizationInfo = getOrganizationInfoFactory(
  ApiEntrepriseClient,
  StubApiRegistreNationalEntreprisesClient,
);
