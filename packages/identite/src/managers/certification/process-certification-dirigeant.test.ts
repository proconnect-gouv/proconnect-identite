//

import { NotFoundError } from "#src/errors";
import { IdentityVectorSchema } from "#src/types";
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
  RogalDornPouvoir,
  UlysseTosiPouvoir,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/testing/seed";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { processCertificationDirigeantFactory } from "./process-certification-dirigeant.js";

//

describe("processCertificationDirigeantFactory", () => {
  it("should recognize a user as executive of a auto-entrepreneur", async () => {
    const processCertificationDirigeant = processCertificationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findPouvoirsBySiren: () => Promise.reject(new Error("💣")),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.resolve(RogalDornEstablishment),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(RogalDornFranceConnectUserInfo),
      },
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      rogal_dorn_org_info,
      1,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "exact_match",
      details: {
        dirigeant: {
          ...IdentityVectorSchema.parse(RogalDornFranceConnectUserInfo),
          birthplace: null, // INSEE adapter returns null for foreigners
        },
        matches: new Set([
          "family_name",
          "first_name",
          "gender",
          "birth_date",
          "birth_country",
        ]),
        identity: IdentityVectorSchema.parse(RogalDornFranceConnectUserInfo),
        source: "api.insee.fr/api-sirene/private",
      },
      ok: true,
    });
  });

  it("should not match another mandataire", async () => {
    const processCertificationDirigeant = processCertificationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findPouvoirsBySiren: () => Promise.reject(new Error("💣")),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.resolve(LiElJonsonEstablishment),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(RogalDornFranceConnectUserInfo),
      },
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      rogal_dorn_org_info,
      1,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "below_threshold",
      details: {
        dirigeant: {
          ...IdentityVectorSchema.parse(LiElJonsonFranceConnectUserInfo),
          birthcountry: null, // INSEE adapter returns null for French people
        },
        matches: new Set(["gender"]),
        identity: IdentityVectorSchema.parse(RogalDornFranceConnectUserInfo),
        source: "api.insee.fr/api-sirene/private",
      },
      ok: false,
    });
  });

  it("should match Rogal Dorn among the executive of Papillon in RNE", async () => {
    const processCertificationDirigeant = processCertificationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findPouvoirsBySiren: () =>
          Promise.resolve([UlysseTosiPouvoir, RogalDornPouvoir]),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(RogalDornFranceConnectUserInfo),
      },
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      papillon_org_info,
      1,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "exact_match",
      details: {
        dirigeant: {
          ...IdentityVectorSchema.parse(RogalDornFranceConnectUserInfo),
          birthplace: null, // RNE adapter returns null for foreigners
        },
        matches: new Set([
          "family_name",
          "first_name",
          "gender",
          "birth_date",
          "birth_country",
        ]),
        identity: IdentityVectorSchema.parse(RogalDornFranceConnectUserInfo),
        source: "registre-national-entreprises.inpi.fr/api",
      },
      ok: true,
    });
  });

  it("should match Rogal Dorn among the executive of Papillon in Infogreffe", async () => {
    const processCertificationDirigeant = processCertificationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () =>
          Promise.resolve([UlysseToriMandataire, RogalDornMandataire]),
      },
      RegistreNationalEntreprisesApiRepository: {
        findPouvoirsBySiren: () => Promise.reject(new Error("💣")),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(RogalDornFranceConnectUserInfo),
      },
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      papillon_org_info,
      1,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "exact_match",
      details: {
        dirigeant: {
          ...IdentityVectorSchema.parse(RogalDornFranceConnectUserInfo),
          birthplace: null, // API Entreprise adapter doesn't provide birthplace
          gender: null, // API Entreprise adapter doesn't provide gender
        },
        matches: new Set([
          "family_name",
          "first_name",
          "gender",
          "birth_date",
          "birth_country",
        ]),
        identity: IdentityVectorSchema.parse(RogalDornFranceConnectUserInfo),
        source:
          "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux",
      },
      ok: true,
    });
  });

  it("❎ fail with no franceconnect user info", async () => {
    const processCertificationDirigeant = processCertificationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findPouvoirsBySiren: () => Promise.reject(new Error("💣")),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () => Promise.resolve(undefined),
      },
    });

    await assert.rejects(
      processCertificationDirigeant(rogal_dorn_org_info, 1),
      new NotFoundError("FranceConnect UserInfo not found"),
    );
  });

  it("❎ fail with no mandataires", async () => {
    const processCertificationDirigeant = processCertificationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findPouvoirsBySiren: () => Promise.resolve([]),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
      FranceConnectApiRepository: {
        getFranceConnectUserInfo: () =>
          Promise.resolve(LiElJonsonFranceConnectUserInfo),
      },
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      papillon_org_info,
      1,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "no_candidates",
      details: {
        dirigeant: undefined,
        identity: IdentityVectorSchema.parse(LiElJonsonFranceConnectUserInfo),
        matches: new Set(),
        source: "registre-national-entreprises.inpi.fr/api",
      },
      ok: false,
    });
  });
});
