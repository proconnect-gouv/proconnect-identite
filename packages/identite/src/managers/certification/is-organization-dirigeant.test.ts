//

import { InvalidCertificationError, NotFoundError } from "#src/errors";
import {
  LiElJonsonFranceConnectUserInfo,
  RogalDornFranceConnectUserInfo,
} from "#testing/seed/franceconnect";
import {
  papillon_org_info,
  rogal_dorn_org_info,
} from "#testing/seed/organizations";
import {
  RogalDornMandataire,
  UlysseToriMandataire,
} from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-infogreffe-rcs-unites_legales-siren-mandataires_sociaux";
import {
  LiElJonsonEstablishment,
  RogalDornEstablishment,
} from "@proconnect-gouv/proconnect.insee/testing/seed";
import {
  RogalDornBeneficiaireEffectif,
  UlysseToriBeneficiaireEffectif,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/testing/seed";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOrganizationDirigeantFactory } from "./is-organization-dirigeant.js";

//

describe("isOrganizationDirigeantFactory", () => {
  it("should recognize a user as executive of a auto-entrepreneur", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findBeneficiairesEffectifsBySiren: () =>
          Promise.reject(new Error("💣")),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.resolve(RogalDornEstablishment),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(RogalDornFranceConnectUserInfo),
      },
    });

    const isDirigeant = await isOrganizationDirigeant(rogal_dorn_org_info, 1);

    assert.deepEqual(isDirigeant, {
      cause: "exact_match",
      details: {
        dirigeant: {
          birthdate: RogalDornFranceConnectUserInfo.birthdate,
          birthplace: "INWIT",
          family_name: "DORN",
          given_name: "ROGAL",
        },
        distance: 0,
        identity: RogalDornFranceConnectUserInfo,
        source: "api.insee.fr/api-sirene/private",
      },
      ok: true,
    });
  });

  it("should not match another mandataire", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findBeneficiairesEffectifsBySiren: () =>
          Promise.reject(new Error("💣")),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.resolve(LiElJonsonEstablishment),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(RogalDornFranceConnectUserInfo),
      },
    });

    const isDirigeant = await isOrganizationDirigeant(rogal_dorn_org_info, 1);

    assert.deepEqual(isDirigeant, {
      cause: "below_threshold",
      details: {
        dirigeant: {
          birthdate: new Date(Date.UTC(28500, 1, 5)),
          birthplace: "INW",
          family_name: "EL'JONSON",
          given_name: "LION",
        },
        distance: 182578,
        identity: RogalDornFranceConnectUserInfo,
        source: "api.insee.fr/api-sirene/private",
      },
      ok: false,
    });
  });

  it("should match Rogal Dorn among the executive of Papillon in RNE", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findBeneficiairesEffectifsBySiren: () =>
          Promise.resolve([
            UlysseToriBeneficiaireEffectif,
            RogalDornBeneficiaireEffectif,
          ]),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(RogalDornFranceConnectUserInfo),
      },
    });

    const isDirigeant = await isOrganizationDirigeant(papillon_org_info, 1);

    assert.deepEqual(isDirigeant, {
      cause: "exact_match",
      details: {
        dirigeant: {
          birthdate: RogalDornFranceConnectUserInfo.birthdate,
          birthplace: "INWIT",
          family_name: "DORN",
          given_name: "ROGAL",
        },
        distance: 0,
        identity: RogalDornFranceConnectUserInfo,
        source: "registre-national-entreprises.inpi.fr/api",
      },
      ok: true,
    });
  });

  it("should match Rogal Dorn among the executive of Papillon in Infogreffe", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () =>
          Promise.resolve([UlysseToriMandataire, RogalDornMandataire]),
      },
      RegistreNationalEntreprisesApiRepository: {
        findBeneficiairesEffectifsBySiren: () =>
          Promise.reject(new Error("💣")),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(RogalDornFranceConnectUserInfo),
      },
    });

    const isDirigeant = await isOrganizationDirigeant(papillon_org_info, 1);

    assert.deepEqual(isDirigeant, {
      cause: "exact_match",
      details: {
        dirigeant: {
          birthdate: RogalDornFranceConnectUserInfo.birthdate,
          birthplace: "INWIT",
          family_name: "DORN",
          given_name: "ROGAL",
        },
        distance: 0,
        identity: RogalDornFranceConnectUserInfo,
        source:
          "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux",
      },
      ok: true,
    });
  });

  it("❎ fail with no franceconnect user info", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findBeneficiairesEffectifsBySiren: () =>
          Promise.reject(new Error("💣")),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () => Promise.resolve(undefined),
      },
    });

    await assert.rejects(
      isOrganizationDirigeant(rogal_dorn_org_info, 1),
      new NotFoundError("FranceConnect UserInfo not found"),
    );
  });

  it("❎ fail with no mandataires", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findBeneficiairesEffectifsBySiren: () => Promise.resolve([]),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(LiElJonsonFranceConnectUserInfo),
      },
    });

    await assert.rejects(
      isOrganizationDirigeant(papillon_org_info, 1),
      new InvalidCertificationError("No candidates found"),
    );
  });
});
