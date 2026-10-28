import { InvalidSiretError } from "#src/errors";
import {
  CommunautéDeCommunes,
  FergusMacDonaldEntrepreneur as FergusMacDonalEntrepreneurApiEntreprise,
  RogalDornEntrepreneur,
} from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";
import {
  ApiEntrepriseError,
  type InseeSireneEstablishmentSiretResponseData,
} from "@proconnect-gouv/proconnect.api_entreprise/types";
import { FergusMacDonaldEntrepreneur as FergusMacDonaldEntrepreneurRne } from "@proconnect-gouv/proconnect.registre_national_entreprises/testing/seed";
import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { getOrganizationInfoFactory } from "./get-organization-info.js";

suite("getOrganizationInfo", () => {
  test("should return valid payload for diffusible siret", async (t) => {
    const getOrganizationInfo = getOrganizationInfoFactory(
      {
        findBySiren: () => Promise.reject(),
        findBySiret: () => Promise.resolve(CommunautéDeCommunes),
        findMandatairesSociauxBySiren: () => Promise.reject(),
      },
      {
        findCompanyBySiren: () => Promise.reject(),
        findPouvoirsBySiren: () => Promise.reject(),
      },
    );
    t.assert.snapshot(await getOrganizationInfo("20007184300060"));
  });

  test("should return valid payload for diffusible siren", async (t) => {
    const getOrganizationInfo = getOrganizationInfoFactory(
      {
        findBySiren: () => Promise.resolve(CommunautéDeCommunes),
        findBySiret: () => Promise.reject(),
        findMandatairesSociauxBySiren: () => Promise.reject(),
      },
      {
        findCompanyBySiren: () => Promise.reject(),
        findPouvoirsBySiren: () => Promise.reject(),
      },
    );
    t.assert.snapshot(await getOrganizationInfo("200071843"));
  });

  test("should return valid payload for diffusible siren with RNE info", async (t) => {
    const getOrganizationInfo = getOrganizationInfoFactory(
      {
        findBySiren: () =>
          Promise.resolve(FergusMacDonalEntrepreneurApiEntreprise),
        findBySiret: () => Promise.reject(),
        findMandatairesSociauxBySiren: () => Promise.reject(),
      },
      {
        findCompanyBySiren: () =>
          Promise.resolve(FergusMacDonaldEntrepreneurRne),
        findPouvoirsBySiren: () => Promise.reject(),
      },
    );
    t.assert.snapshot(await getOrganizationInfo("200071843"));
  });

  test("should show partial data for partially non diffusible établissement", async (t) => {
    const getOrganizationInfo = getOrganizationInfoFactory(
      {
        findBySiren: () => Promise.reject(),
        findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
        findMandatairesSociauxBySiren: () => Promise.reject(),
      },
      {
        findCompanyBySiren: () => Promise.reject(),
        findPouvoirsBySiren: () => Promise.reject(),
      },
    );

    t.assert.snapshot(await getOrganizationInfo("94957325700019"));
  });

  test("should return not_diffusible for totally non diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory(
      {
        findBySiren: () => Promise.reject(),
        findBySiret: () =>
          Promise.resolve({
            status_diffusion: "non_diffusible",
          } as InseeSireneEstablishmentSiretResponseData),
        findMandatairesSociauxBySiren: () => Promise.reject(),
      },
      {
        findCompanyBySiren: () => Promise.reject(),
        findPouvoirsBySiren: () => Promise.reject(),
      },
    );
    assert.deepEqual(await getOrganizationInfo("53512638700013"), {
      kind: "not_diffusible",
    });
  });

  test("should return invalid_siret for a malformed input", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory(
      {
        findBySiren: () => Promise.reject(),
        findBySiret: () => Promise.reject(),
        findMandatairesSociauxBySiren: () => Promise.reject(),
      },
      {
        findCompanyBySiren: () => Promise.reject(),
        findPouvoirsBySiren: () => Promise.reject(),
      },
    );
    assert.deepEqual(await getOrganizationInfo("1234"), {
      exception: new InvalidSiretError("siret or siren must be 9 or 14 digits"),
      kind: "invalid_siret",
    });
  });

  test("should return invalid_siret when entreprise.api.gouv.fr rejects the siret", async () => {
    const rejection = new ApiEntrepriseError({
      errors: [
        {
          code: "00302",
          detail: "Le numéro de siret n'est pas correctement formatté",
          title: "Entité non traitable",
        },
      ],
    });
    const getOrganizationInfo = getOrganizationInfoFactory(
      {
        findBySiren: () => Promise.reject(),
        findBySiret: () => Promise.reject(rejection),
        findMandatairesSociauxBySiren: () => Promise.reject(),
      },
      {
        findCompanyBySiren: () => Promise.reject(),
        findPouvoirsBySiren: () => Promise.reject(),
      },
    );
    assert.deepEqual(await getOrganizationInfo("20007184300061"), {
      exception: new InvalidSiretError("rejected by entreprise.api.gouv.fr", {
        cause: rejection,
      }),
      kind: "invalid_siret",
    });
  });

  test("should return api_entreprise_failed when entreprise.api.gouv.fr fails", async () => {
    const exception = new Error("ECONNRESET");
    const getOrganizationInfo = getOrganizationInfoFactory(
      {
        findBySiren: () => Promise.reject(),
        findBySiret: () => Promise.reject(exception),
        findMandatairesSociauxBySiren: () => Promise.reject(),
      },
      {
        findCompanyBySiren: () => Promise.reject(),
        findPouvoirsBySiren: () => Promise.reject(),
      },
    );
    assert.deepEqual(await getOrganizationInfo("20007184300060"), {
      exception,
      kind: "api_entreprise_failed",
    });
  });
});
