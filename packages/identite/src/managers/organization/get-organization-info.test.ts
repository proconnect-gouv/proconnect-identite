import { NotFoundError } from "#src/errors";
import {
  CommunautéDeCommunes,
  JeanPierreEntrepreneur,
} from "@gouvfr-lasuite/proconnect.entreprise/testing/seed/siret";
import type { InseeSiretEstablishment } from "@gouvfr-lasuite/proconnect.entreprise/types";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { getOrganizationInfoFactory } from "./get-organization-info.js";

chai.use(chaiAsPromised);
const assert = chai.assert;

describe("getOrganizationInfo", () => {
  const diffusibleOrganizationInfo = {
    siret: "20007184300060",
    libelle: "Cc du vexin normand",
    nomComplet: "Cc du vexin normand",
    enseigne: "",
    trancheEffectifs: "22",
    trancheEffectifsUniteLegale: "22",
    libelleTrancheEffectif: "100 à 199 salariés, en 2022",
    etatAdministratif: "A",
    estActive: true,
    statutDiffusion: "diffusible",
    estDiffusible: true,
    adresse: "3 rue maison de vatimesnil, 27150 Etrepagny",
    codePostal: "27150",
    codeOfficielGeographique: "27226",
    activitePrincipale: "84.11Z",
    libelleActivitePrincipale: "84.11Z - Administration publique générale",
    categorieJuridique: "7346",
    libelleCategorieJuridique: "Communauté de communes",
  };

  it("should return valid payload for diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () => Promise.resolve(CommunautéDeCommunes),
    });
    await assert.eventually.deepEqual(
      getOrganizationInfo("20007184300060"),
      diffusibleOrganizationInfo,
    );
  });

  it("should return valid payload for diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.resolve(CommunautéDeCommunes),
      findBySiret: () => Promise.reject(),
    });
    await assert.eventually.deepEqual(
      getOrganizationInfo("200071843"),
      diffusibleOrganizationInfo,
    );
  });

  it("should show partial data for partially non diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () => Promise.resolve(JeanPierreEntrepreneur),
    });

    await assert.eventually.deepEqual(getOrganizationInfo("94957325700019"), {
      siret: "94957325700019",
      libelle: "Nom inconnu",
      nomComplet: "Nom inconnu",
      enseigne: "",
      trancheEffectifs: null,
      trancheEffectifsUniteLegale: null,
      libelleTrancheEffectif: "",
      etatAdministratif: "A",
      estActive: true,
      statutDiffusion: "partiellement_diffusible",
      estDiffusible: false,
      adresse: "06155 Vallauris",
      codePostal: "06155",
      codeOfficielGeographique: "06155",
      activitePrincipale: "62.02A",
      libelleActivitePrincipale:
        "62.02A - Conseil en systèmes et logiciels informatiques",
      categorieJuridique: "1000",
      libelleCategorieJuridique: "Entrepreneur individuel",
    });
  });

  it.skip("should throw for totally non diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () =>
        Promise.resolve({
          status_diffusion: "non_diffusible",
        } as InseeSiretEstablishment),
    });
    await assert.isRejected(
      getOrganizationInfo("53512638700013"),
      NotFoundError,
    );
  });
});
