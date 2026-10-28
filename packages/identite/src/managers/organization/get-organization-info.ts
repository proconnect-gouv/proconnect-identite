//

import { InvalidSiretError } from "#src/errors";
import { type OrganizationInfo } from "#src/types";
import type { ApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import {
  ApiEntrepriseInvalidSiret,
  type InseeSireneEstablishmentSiretResponseData,
} from "@proconnect-gouv/proconnect.api_entreprise/types";
import type { ApiRegistreNationalEntreprisesClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import * as ApiEntreprise from "./adapters/api_entreprise.js";
import * as ApiRne from "./adapters/rne.js";

//

export type RneEnrichment =
  | { kind: "enriched" }
  | { kind: "failed"; exception: unknown };

export type OrganizationInfoLookup =
  | { kind: "api_entreprise_failed"; exception: unknown }
  | { kind: "found"; organization_info: OrganizationInfo; rne: RneEnrichment }
  | { kind: "invalid_siret"; exception: InvalidSiretError }
  | { kind: "not_diffusible" };

export function getOrganizationInfoFactory(
  apiEntrepriseClient: ApiEntrepriseClient,
  apiRneClient: ApiRegistreNationalEntreprisesClient,
) {
  async function findApiEntrepriseData(siretOrSiren: string) {
    if (/^\d{14}$/.test(siretOrSiren))
      return apiEntrepriseClient.findBySiret(siretOrSiren);
    return apiEntrepriseClient.findBySiren(siretOrSiren);
  }

  return async function getOrganizationInfo(
    siretOrSiren: string,
  ): Promise<OrganizationInfoLookup> {
    if (!/^(\d{9}|\d{14})$/.test(siretOrSiren))
      return {
        exception: new InvalidSiretError(
          "siret or siren must be 9 or 14 digits",
        ),
        kind: "invalid_siret",
      };

    let apiEntrepriseData: InseeSireneEstablishmentSiretResponseData;
    try {
      apiEntrepriseData = await findApiEntrepriseData(siretOrSiren);
    } catch (exception) {
      if (ApiEntrepriseInvalidSiret.isInvalidSiret(exception))
        return {
          exception: new InvalidSiretError(
            "rejected by entreprise.api.gouv.fr",
            { cause: exception },
          ),
          kind: "invalid_siret",
        };
      return { exception, kind: "api_entreprise_failed" };
    }

    if (apiEntrepriseData.status_diffusion === "non_diffusible")
      return { kind: "not_diffusible" };

    const organizationInfo: OrganizationInfo = {
      ...ApiEntreprise.toApiEntrepriseOrganizationInfo(apiEntrepriseData),
      denominationUsuelleEtablissementPrincipal: null,
    };

    try {
      const apiRneData = await apiRneClient.findCompanyBySiren(
        siretOrSiren.slice(0, 9),
      );
      return {
        kind: "found",
        organization_info: {
          ...organizationInfo,
          ...ApiRne.toApiRneOrganizationInfo(apiRneData),
        },
        rne: { kind: "enriched" },
      };
    } catch (exception) {
      return {
        kind: "found",
        organization_info: organizationInfo,
        rne: { exception, kind: "failed" },
      };
    }
  };
}

export type GetOrganizationInfoHandler = ReturnType<
  typeof getOrganizationInfoFactory
>;
