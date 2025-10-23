//

import { InvalidCertificationError, NotFoundError } from "#src/errors";
import {
  LiElJonsonFranceConnectUserInfo,
  RogalDornFranceConnectUserInfo,
} from "#testing/seed/franceconnect";
import {
  RogalDornMandataire,
  UlysseToriMandataire,
} from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-infogreffe-rcs-unites_legales-siren-mandataires_sociaux";
import {
  Papillon,
  RogalDornEntrepreneur as RogalDornSireneEntrepreneur,
} from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";
import {
  LiElJonsonEstablishment,
  RogalDornEstablishment,
} from "@proconnect-gouv/proconnect.insee/testing/seed/establishments";
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
      ApiEntrepriseInseeRepository: {
        findBySiret: () => Promise.resolve(RogalDornSireneEntrepreneur),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.resolve(RogalDornEstablishment),
      },
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isDirigeant = await isOrganizationDirigeant(
      RogalDornSireneEntrepreneur.siret,
      1,
    );
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
      ApiEntrepriseInseeRepository: {
        findBySiret: () => Promise.resolve(RogalDornSireneEntrepreneur),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.resolve(LiElJonsonEstablishment),
      },
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isDirigeant = await isOrganizationDirigeant(
      RogalDornSireneEntrepreneur.siret,
      1,
    );
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

  it("should match Rogal Dorn among the executive of Papillon", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () =>
          Promise.resolve([UlysseToriMandataire, RogalDornMandataire]),
      },
      ApiEntrepriseInseeRepository: {
        findBySiret: () => Promise.resolve(Papillon),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.reject(new Error("💣")),
      },
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isDirigeant = await isOrganizationDirigeant(Papillon.siret, 1);
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
      ApiEntrepriseInseeRepository: {
        findBySiret: () => Promise.resolve(RogalDornSireneEntrepreneur),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.reject(new Error("💣")),
      },
      getFranceConnectUserInfo: () => Promise.resolve(undefined),
    });

    await assert.rejects(
      isOrganizationDirigeant("94957325700019", 1),
      new NotFoundError("FranceConnect UserInfo not found"),
    );
  });

  it("❎ fail with no mandataires", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.resolve([]),
      },
      ApiEntrepriseInseeRepository: {
        findBySiret: () => Promise.resolve(Papillon),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.reject(new Error("💣")),
      },
      getFranceConnectUserInfo: () =>
        Promise.resolve(LiElJonsonFranceConnectUserInfo),
    });

    await assert.rejects(
      isOrganizationDirigeant(Papillon.siret, 1),
      new InvalidCertificationError("No candidates found"),
    );
  });
});
