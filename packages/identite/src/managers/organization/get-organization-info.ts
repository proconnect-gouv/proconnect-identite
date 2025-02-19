import type { OrganizationInfo } from "#src/types";
import {
  type FindBySirenHandler,
  type FindBySiretHandler,
} from "@gouvfr-lasuite/proconnect.insee/api";
import {
  InseeConnectionError,
  InseeNotFoundError,
  InvalidSiretError,
} from "@gouvfr-lasuite/proconnect.insee/errors";
import {
  formatAdresseEtablissement,
  formatEnseigne,
  formatNomComplet,
  libelleFromCategoriesJuridiques,
  libelleFromCodeEffectif,
  libelleFromCodeNaf,
} from "@gouvfr-lasuite/proconnect.insee/formatters";
import type { InseeEtablissement } from "@gouvfr-lasuite/proconnect.insee/types";
import { AxiosError } from "axios";
import { cloneDeep, set } from "lodash-es";

const hideNonDiffusibleData = (
  etablissement: InseeEtablissement,
): InseeEtablissement => {
  const hiddenEtablissement = cloneDeep(etablissement);
  set(hiddenEtablissement, "uniteLegale.denominationUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.sigleUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.denominationUsuelle1UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.denominationUsuelle2UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.denominationUsuelle3UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.sexeUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.nomUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.nomUsageUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenom1UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenom2UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenom3UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenom4UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenomUsuelUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.pseudonymeUniteLegale", null);
  set(
    hiddenEtablissement,
    "adresseEtablissement.complementAdresseEtablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresseEtablissement.numeroVoieEtablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresseEtablissement.indiceRepetitionEtablissement",
    null,
  );
  set(hiddenEtablissement, "adresseEtablissement.typeVoieEtablissement", null);
  set(
    hiddenEtablissement,
    "adresseEtablissement.libelleVoieEtablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.complementAdresse2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.numeroVoie2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.indiceRepetition2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.typeVoie2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.libelleVoie2Etablissement",
    null,
  );

  set(
    hiddenEtablissement,
    "periodesEtablissement.0.enseigne1Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "periodesEtablissement.0.enseigne2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "periodesEtablissement.0.enseigne3Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "periodesEtablissement.0.denominationUsuelleEtablissement",
    null,
  );

  return hiddenEtablissement;
};

type FactoryDependencies = {
  findBySiret: FindBySiretHandler;
  findBySiren: FindBySirenHandler;
};

export function getOrganizationInfoFactory(dependencies: FactoryDependencies) {
  const { findBySiren, findBySiret } = dependencies;
  return async function getOrganizationInfo(
    siretOrSiren: string,
  ): Promise<OrganizationInfo> {
    try {
      let etablissement: InseeEtablissement;

      if (siretOrSiren.match(/^\d{14}$/)) {
        etablissement = await findBySiret(siretOrSiren);
      } else if (siretOrSiren.match(/^\d{9}$/)) {
        etablissement = await findBySiren(siretOrSiren);
      } else {
        throw new InvalidSiretError();
      }

      const { statutDiffusionEtablissement } = etablissement;

      if (statutDiffusionEtablissement === "N") {
        throw new InseeNotFoundError();
      }

      if (statutDiffusionEtablissement === "P") {
        etablissement = hideNonDiffusibleData(etablissement);
      }

      const {
        siret: siretFromInseeApi,
        trancheEffectifsEtablissement,
        anneeEffectifsEtablissement,
        adresseEtablissement,
        periodesEtablissement,
        uniteLegale,
      } = etablissement;

      const {
        categorieJuridiqueUniteLegale,
        denominationUniteLegale,
        sigleUniteLegale,
        nomUniteLegale,
        nomUsageUniteLegale,
        prenomUsuelUniteLegale,
        trancheEffectifsUniteLegale,
      } = uniteLegale;

      // get last period to obtain most recent data
      const {
        activitePrincipaleEtablissement,
        enseigne1Etablissement,
        enseigne2Etablissement,
        enseigne3Etablissement,
        etatAdministratifEtablissement,
      } = periodesEtablissement[0];

      const { codePostalEtablissement, codeCommuneEtablissement } =
        adresseEtablissement;

      const enseigne = formatEnseigne(
        enseigne1Etablissement,
        enseigne2Etablissement,
        enseigne3Etablissement,
      );

      const nomComplet = formatNomComplet({
        denominationUniteLegale,
        prenomUsuelUniteLegale,
        nomUniteLegale,
        nomUsageUniteLegale,
        sigleUniteLegale,
      });

      const organizationLabel = `${nomComplet}${
        enseigne ? ` - ${enseigne}` : ""
      }`;

      return {
        siret: siretFromInseeApi,
        libelle: organizationLabel,
        nomComplet,
        enseigne,
        trancheEffectifs: trancheEffectifsEtablissement,
        trancheEffectifsUniteLegale,
        libelleTrancheEffectif: trancheEffectifsEtablissement
          ? (libelleFromCodeEffectif(
              trancheEffectifsEtablissement,
              anneeEffectifsEtablissement,
            ) ?? "")
          : "",
        etatAdministratif: etatAdministratifEtablissement,
        estActive: etatAdministratifEtablissement === "A",
        statutDiffusion: statutDiffusionEtablissement,
        estDiffusible: statutDiffusionEtablissement === "O",
        adresse: formatAdresseEtablissement(adresseEtablissement),
        codePostal: codePostalEtablissement,
        codeOfficielGeographique: codeCommuneEtablissement,
        activitePrincipale: activitePrincipaleEtablissement,
        libelleActivitePrincipale: libelleFromCodeNaf(
          activitePrincipaleEtablissement,
        ),
        categorieJuridique: String(categorieJuridiqueUniteLegale),
        libelleCategorieJuridique:
          libelleFromCategoriesJuridiques(categorieJuridiqueUniteLegale) ?? "",
      };
    } catch (e) {
      if (
        e instanceof AxiosError &&
        e.response &&
        [403, 404].includes(e.response.status)
      ) {
        throw new InseeNotFoundError();
      }

      if (
        e instanceof AxiosError &&
        (e.code === "ECONNABORTED" ||
          e.code === "ERR_BAD_RESPONSE" ||
          e.code === "EAI_AGAIN")
      ) {
        throw new InseeConnectionError();
      }

      throw e;
    }
  };
}

export type GetOrganizationInfoHandler = ReturnType<
  typeof getOrganizationInfoFactory
>;
