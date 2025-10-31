//

import { InvalidSiretError, NotFoundError } from "#src/errors";
import { type OrganizationInfo } from "#src/types";
import type { ApiEntrepriseInseeRepository } from "@proconnect-gouv/proconnect.api_entreprise/api";
import {
  ApiEntrepriseConnectionError,
  ApiEntrepriseInvalidSiret,
} from "@proconnect-gouv/proconnect.api_entreprise/types";
import * as ApiEntreprise from "./adapters/api_entreprise.js";

//

export function getOrganizationInfoFactory(
  config: ApiEntrepriseInseeRepository,
) {
  const { findBySiren, findBySiret } = config;

  return async function getOrganizationInfo(
    siretOrSiren: string,
  ): Promise<OrganizationInfo> {
    try {
      let establishment: OrganizationInfo;

      if (siretOrSiren.match(/^\d{14}$/)) {
        establishment = ApiEntreprise.toOrganizationInfo(
          await findBySiret(siretOrSiren),
        );
      } else if (siretOrSiren.match(/^\d{9}$/)) {
        establishment = ApiEntreprise.toOrganizationInfo(
          await findBySiren(siretOrSiren),
        );
      } else {
        throw new InvalidSiretError();
      }

      const { statutDiffusion } = establishment;

      if (statutDiffusion === "non_diffusible") {
        throw new NotFoundError();
      }

      return establishment;
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
