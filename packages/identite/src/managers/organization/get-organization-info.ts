//

import { InvalidSiretError, NotFoundError } from "#src/errors";
import {
  type ApiEntrepriseOrganizationInfo,
  type ApiRneOrganizationInfo,
  type OrganizationInfo,
} from "#src/types";
import type { ApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import {
  ApiEntrepriseConnectionError,
  ApiEntrepriseInvalidSiret,
} from "@proconnect-gouv/proconnect.api_entreprise/types";
import type { ApiRegistreNationalEntreprisesClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import * as ApiEntreprise from "./adapters/api_entreprise.js";
import * as ApiRne from "./adapters/rne.js";

//

export function getOrganizationInfoFactory(
  apiEntrepriseClient: ApiEntrepriseClient,
  apiRneClient: ApiRegistreNationalEntreprisesClient,
  options?: { enhanceOrganizationInfoWithRneData?: boolean },
) {
  return async function getOrganizationInfo(
    siretOrSiren: string,
  ): Promise<OrganizationInfo> {
    let organizationInfo: OrganizationInfo;
    try {
      let apiEntrepriseOrganizationInfo: ApiEntrepriseOrganizationInfo;
      let apiRneOrganizationInfo: ApiRneOrganizationInfo;

      if (siretOrSiren.match(/^\d{14}$/)) {
        apiEntrepriseOrganizationInfo =
          ApiEntreprise.toApiEntrepriseOrganizationInfo(
            await apiEntrepriseClient.findBySiret(siretOrSiren),
          );
      } else if (siretOrSiren.match(/^\d{9}$/)) {
        apiEntrepriseOrganizationInfo =
          ApiEntreprise.toApiEntrepriseOrganizationInfo(
            await apiEntrepriseClient.findBySiren(siretOrSiren),
          );
      } else {
        throw new InvalidSiretError();
      }

      const { statutDiffusion } = apiEntrepriseOrganizationInfo;

      if (statutDiffusion === "non_diffusible") {
        throw new NotFoundError();
      }
      organizationInfo = {
        ...apiEntrepriseOrganizationInfo,
      };
      if (!options?.enhanceOrganizationInfoWithRneData) {
        return organizationInfo;
      }

      try {
        const siren =
          siretOrSiren.length === 14 ? siretOrSiren.slice(0, 9) : siretOrSiren;

        const apiRneData = await apiRneClient.findCompanyBySiren(siren);
        apiRneOrganizationInfo = ApiRne.toApiRneOrganizationInfo(apiRneData);
        organizationInfo = {
          ...organizationInfo,
          ...apiRneOrganizationInfo,
        };
      } catch (error) {
        console.error("Error while fetching RNE data", error);
        console.log("RNE data will be undefined for this organization");
      }

      return organizationInfo;
    } catch (e) {
      if (ApiEntrepriseInvalidSiret.isInvalidSiret(e))
        throw new InvalidSiretError();

      throw new ApiEntrepriseConnectionError(
        "unknown error while fetching entreprise.api.gouv.fr",
        { cause: e },
      );
    }
  };
}

export type GetOrganizationInfoHandler = ReturnType<
  typeof getOrganizationInfoFactory
>;
