//

import { NotFoundError } from "#src/errors";
import { fromInfogreffe } from "#src/mappers/certification";
import type { GetFranceConnectUserInfoHandler } from "#src/repositories/user";
import type { FindMandatairesSociauxBySirenHandler } from "@gouvfr-lasuite/proconnect.entreprise/api/infogreffe";
import type { FindBySiretHandler } from "@gouvfr-lasuite/proconnect.entreprise/api/insee";
import { distance } from "./distance.js";

//

type IsOrganizationExecutiveFactoryFactoryConfig = {
  EQUALITY_THRESHOLD?: number;
  findBySiret: FindBySiretHandler;
  findMandatairesSociauxBySiren: FindMandatairesSociauxBySirenHandler;
  getFranceConnectUserInfo: GetFranceConnectUserInfoHandler;
  log?: typeof console.log;
};

//

export function isOrganizationDirigeantFactory(
  config: IsOrganizationExecutiveFactoryFactoryConfig,
) {
  const {
    EQUALITY_THRESHOLD = 0,
    findBySiret,
    findMandatairesSociauxBySiren,
    getFranceConnectUserInfo,
    log = () => {},
  } = config;

  return async function isOrganizationDirigeant(
    siret: string,
    user_id: number,
  ) {
    const establishment = await findBySiret(siret);
    const franceconnectUserInfo = await getFranceConnectUserInfo(user_id);
    if (!franceconnectUserInfo) {
      throw new NotFoundError("FranceConnect UserInfo not found");
    }

    const mandataires = await findMandatairesSociauxBySiren(
      establishment.unite_legale.siren,
    );

    const sourceDirigeants = mandataires.map((mandataire) =>
      fromInfogreffe(mandataire),
    );

    if (sourceDirigeants.length === 0) {
      throw new NotFoundError("No mandataires found");
    }

    const distances = sourceDirigeants.map((sourceDirigeant) =>
      Math.abs(distance(franceconnectUserInfo, sourceDirigeant)),
    );

    const closestSourceDirigeantDistance = Math.min(...distances);
    const closestSourceDirigeant =
      sourceDirigeants[distances.indexOf(closestSourceDirigeantDistance)];

    log(
      closestSourceDirigeant,
      " is the closest source dirigeant to ",
      franceconnectUserInfo,
      " with a distance of ",
      closestSourceDirigeantDistance,
    );

    return closestSourceDirigeantDistance === EQUALITY_THRESHOLD;
  };
}

export type IsOrganizationDirigeantHandler = ReturnType<
  typeof isOrganizationDirigeantFactory
>;
