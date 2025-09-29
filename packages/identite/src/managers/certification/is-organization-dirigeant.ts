//

import { NotFoundError } from "#src/errors";
import { fromInfogreffe } from "#src/mappers/certification";
import { fromSiret } from "#src/mappers/organization";
import type { GetFranceConnectUserInfoHandler } from "#src/repositories/user";
import { isEntrepriseUnipersonnelle } from "#src/services/organization";
import type { IdentityVector } from "#src/types";
import type {
  EntrepriseApiInfogreffeRepository,
  EntrepriseApiInseeRepository,
} from "@gouvfr-lasuite/proconnect.entreprise/api";
import type { InseeSireneEstablishmentSiretResponseData } from "@gouvfr-lasuite/proconnect.entreprise/types";
import type { InseeApiRepository } from "@gouvfr-lasuite/proconnect.insee/api";
import { formatBirthdate } from "@gouvfr-lasuite/proconnect.insee/formatters";
import { distance } from "./distance.js";

//

type IsOrganizationExecutiveFactoryFactoryConfig = {
  EntrepriseApiInfogreffeRepository: EntrepriseApiInfogreffeRepository;
  EntrepriseApiInseeRepository: Pick<
    EntrepriseApiInseeRepository,
    "findBySiret"
  >;
  EQUALITY_THRESHOLD?: number;
  getFranceConnectUserInfo: GetFranceConnectUserInfoHandler;
  InseeApiRepository: Pick<InseeApiRepository, "findBySiret">;
  log?: typeof console.log;
};

//

export function isOrganizationDirigeantFactory(
  config: IsOrganizationExecutiveFactoryFactoryConfig,
) {
  const {
    EQUALITY_THRESHOLD = 0,
    EntrepriseApiInseeRepository,
    EntrepriseApiInfogreffeRepository,
    InseeApiRepository,
    getFranceConnectUserInfo,
    log = () => {},
  } = config;

  return async function isOrganizationDirigeant(
    siret: string,
    user_id: number,
  ) {
    const establishment = await EntrepriseApiInseeRepository.findBySiret(siret);
    const franceconnectUserInfo = await getFranceConnectUserInfo(user_id);
    if (!franceconnectUserInfo) {
      throw new NotFoundError("FranceConnect UserInfo not found");
    }

    const sourceDirigeants =
      await getSourceDirigeantsFromEstablishment(establishment);

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

  async function getSourceDirigeantsFromEstablishment(
    establishment: InseeSireneEstablishmentSiretResponseData,
  ): Promise<IdentityVector[]> {
    const organization = fromSiret(establishment);

    if (
      isEntrepriseUnipersonnelle({
        cached_libelle_categorie_juridique:
          organization.libelleCategorieJuridique,
        cached_tranche_effectifs: organization.trancheEffectifs,
      })
    ) {
      return getSourceDirigeantsFromInsseApi(establishment.siret);
    }
    return getSourceDirigeantsFromEntrepriseApi(
      establishment.unite_legale.siren,
    );
  }

  async function getSourceDirigeantsFromInsseApi(siret: string) {
    const { uniteLegale } = await InseeApiRepository.findBySiret(siret);
    const birthdate = formatBirthdate(
      String(uniteLegale?.dateNaissanceUniteLegale),
    );

    return [
      {
        birthplace: uniteLegale?.codeCommuneNaissanceUniteLegale ?? null,
        birthdate: isNaN(birthdate.getTime()) ? null : birthdate,
        family_name: uniteLegale?.nomUniteLegale ?? null,
        given_name: [
          uniteLegale?.prenom1UniteLegale,
          uniteLegale?.prenom2UniteLegale,
          uniteLegale?.prenom3UniteLegale,
          uniteLegale?.prenom4UniteLegale,
        ]
          .filter(Boolean)
          .join(" "),
      } satisfies IdentityVector,
    ];
  }

  async function getSourceDirigeantsFromEntrepriseApi(siren: string) {
    const mandataires =
      await EntrepriseApiInfogreffeRepository.findMandatairesSociauxBySiren(
        siren,
      );

    return mandataires.map((mandataire) => fromInfogreffe(mandataire));
  }
}

export type IsOrganizationDirigeantHandler = ReturnType<
  typeof isOrganizationDirigeantFactory
>;
