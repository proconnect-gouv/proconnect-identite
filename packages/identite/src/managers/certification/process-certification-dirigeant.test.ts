//

import { IdentityVectorSchema } from "#src/types";
import {
  AmberleyVailFranceConnectUserInfo,
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
  AmberleyVailPouvoir,
  RogalDornPouvoir,
  UlysseTosiPouvoir,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/testing/seed";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as ApiEntreprise from "./adapters/api_entreprise.js";
import * as INSEE from "./adapters/insee.js";
import * as RNE from "./adapters/rne.js";
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
        findBySiren: () => Promise.resolve(LiElJonsonEstablishment),
      },
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      rogal_dorn_org_info,
      LiElJonsonFranceConnectUserInfo,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "exact_match",
      details: {
        dirigeant: INSEE.toIdentityVector(LiElJonsonEstablishment),
        matches: new Set([
          "family_name",
          "first_name",
          "gender",
          "birth_date",
          "birth_place",
        ]),
        identity: IdentityVectorSchema.parse(LiElJonsonFranceConnectUserInfo),
        source: "api.insee.fr/api-sirene/private",
      },
      ok: true,
    });
  });

  it("should recognize a foreign user as executive of a auto-entrepreneur", async () => {
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
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      rogal_dorn_org_info,
      RogalDornFranceConnectUserInfo,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "exact_match",
      details: {
        dirigeant: INSEE.toIdentityVector(RogalDornEstablishment),
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
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      rogal_dorn_org_info,
      RogalDornFranceConnectUserInfo,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "below_threshold",
      details: {
        dirigeant: INSEE.toIdentityVector(LiElJonsonEstablishment),
        matches: new Set(["gender", "birth_country"]),
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
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      papillon_org_info,
      RogalDornFranceConnectUserInfo,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "exact_match",
      details: {
        dirigeant: RNE.toIdentityVector(RogalDornPouvoir),
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

  it("should match Amberley Vail among the executive of Papillon in RNE", async () => {
    const processCertificationDirigeant = processCertificationDirigeantFactory({
      ApiEntrepriseInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      RegistreNationalEntreprisesApiRepository: {
        findPouvoirsBySiren: () =>
          Promise.resolve([UlysseTosiPouvoir, AmberleyVailPouvoir]),
      },
      InseeApiRepository: {
        findBySiren: () => Promise.reject(new Error("💣")),
      },
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      papillon_org_info,
      AmberleyVailFranceConnectUserInfo,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "exact_match",
      details: {
        dirigeant: RNE.toIdentityVector(AmberleyVailPouvoir),
        matches: new Set([
          "family_name",
          "first_name",
          "gender",
          "birth_date",
          "birth_country",
        ]),
        identity: IdentityVectorSchema.parse(AmberleyVailFranceConnectUserInfo),
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
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      papillon_org_info,
      RogalDornFranceConnectUserInfo,
    );

    assert.deepEqual(certificationDirigeantResult, {
      cause: "exact_match",
      details: {
        dirigeant: ApiEntreprise.toIdentityVector(RogalDornMandataire),
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
    });

    const certificationDirigeantResult = await processCertificationDirigeant(
      papillon_org_info,
      LiElJonsonFranceConnectUserInfo,
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
