//

import { InvalidSiretError, NotFoundError } from "#src/errors";
import { OrganizationInfoMapper } from "#src/mappers";
import { type OrganizationInfo } from "#src/types";
import type { EntrepriseApiInseeRepository } from "@proconnect-gouv/proconnect.entreprise/api";
import {
  EntrepriseApiConnectionError,
  EntrepriseApiInvalidSiret,
} from "@proconnect-gouv/proconnect.entreprise/types";

//

export function getOrganizationInfoFactory(
  config: EntrepriseApiInseeRepository,
) {
  const { findBySiren, findBySiret } = config;

  return async function getOrganizationInfo(
    siretOrSiren: string,
  ): Promise<OrganizationInfo> {
    try {
      let establishment: OrganizationInfo;

      if (siretOrSiren.match(/^\d{14}$/)) {
        establishment = OrganizationInfoMapper.fromSiret(
          await findBySiret(siretOrSiren),
        );
      } else if (siretOrSiren.match(/^\d{9}$/)) {
        establishment = OrganizationInfoMapper.fromSiret(
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
      if (EntrepriseApiInvalidSiret.isInvalidSiret(e))
        throw new InvalidSiretError();

      throw new EntrepriseApiConnectionError(
        "unknown error while fetching entreprise.api.gouv.fr",
        { cause: e },
      );
    }
  };
}

export type GetOrganizationInfoHandler = ReturnType<
  typeof getOrganizationInfoFactory
>;
