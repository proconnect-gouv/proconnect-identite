//

import { IdentityVectorSchema } from "#src/types";
import {
  api_entreprise_mock_client,
  api_insee_mock_client,
  api_registre_national_entreprises_mock_client,
  context,
} from "#testing";
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

const processCertificationDirigeant =
  processCertificationDirigeantFactory(context);

describe("processCertificationDirigeantFactory", () => {
  it("should recognize a user as executive of a auto-entrepreneur", async () => {
    api_insee_mock_client.findBySiren.mock.mockImplementationOnce(() =>
      Promise.resolve({
        ...LiElJonsonEstablishment,
        dateDernierTraitementUniteLegale: "2026-03-01T10:00:00",
      }),
    );

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
        source_selection: { kind: "preferred" },
        source_updated_at: "2026-03-01T10:00:00",
      },
      ok: true,
    });
  });

  it("should recognize a foreign user as executive of a auto-entrepreneur", async () => {
    api_insee_mock_client.findBySiren.mock.mockImplementationOnce(() =>
      Promise.resolve(RogalDornEstablishment),
    );
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
        source_selection: { kind: "preferred" },
        source_updated_at: null,
      },
      ok: true,
    });
  });

  it("should not match another mandataire", async () => {
    api_insee_mock_client.findBySiren.mock.mockImplementationOnce(() =>
      Promise.resolve(LiElJonsonEstablishment),
    );

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
        source_selection: { kind: "preferred" },
        source_updated_at: null,
      },
      ok: false,
    });
  });

  it("should match Rogal Dorn among the executive of Papillon in RNE", async () => {
    api_registre_national_entreprises_mock_client.findPouvoirsBySiren.mock.mockImplementationOnce(
      () =>
        Promise.resolve({
          pouvoirs: [UlysseTosiPouvoir, RogalDornPouvoir],
          updated_at: "2026-09-26T23:06:11+02:00",
        }),
    );

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
        source_selection: { kind: "preferred" },
        source_updated_at: "2026-09-26T23:06:11+02:00",
      },
      ok: true,
    });
  });

  it("should match Amberley Vail among the executive of Papillon in RNE", async () => {
    api_registre_national_entreprises_mock_client.findPouvoirsBySiren.mock.mockImplementationOnce(
      () =>
        Promise.resolve({
          pouvoirs: [UlysseTosiPouvoir, AmberleyVailPouvoir],
          updated_at: null,
        }),
    );

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
        source_selection: { kind: "preferred" },
        source_updated_at: null,
      },
      ok: true,
    });
  });

  it("should match Rogal Dorn in Infogreffe when RNE fails", async () => {
    const exception = new Error("RNE unavailable");
    api_registre_national_entreprises_mock_client.findPouvoirsBySiren.mock.mockImplementationOnce(
      () => Promise.reject(exception),
    );
    api_entreprise_mock_client.findMandatairesSociauxBySiren.mock.mockImplementationOnce(
      () => Promise.resolve([UlysseToriMandataire, RogalDornMandataire]),
    );

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
        source_selection: { exception, kind: "fallback" },
        source_updated_at: null,
      },
      ok: true,
    });
  });

  it("❎ fail with no mandataires", async () => {
    api_registre_national_entreprises_mock_client.findPouvoirsBySiren.mock.mockImplementationOnce(
      () => Promise.resolve({ pouvoirs: [], updated_at: null }),
    );

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
        source_selection: { kind: "preferred" },
        source_updated_at: null,
      },
      ok: false,
    });
  });
});
