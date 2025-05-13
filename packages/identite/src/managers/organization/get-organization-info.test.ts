import { NotFoundError } from "#src/errors";
import {
  CommunautéDeCommunes,
  RogalDornEntrepreneur,
} from "@gouvfr-lasuite/proconnect.entreprise/testing/seed/insee/siret";
import type { InseeSiretEstablishment } from "@gouvfr-lasuite/proconnect.entreprise/types";
import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { getOrganizationInfoFactory } from "./get-organization-info.js";

suite("getOrganizationInfo", () => {
  test("should return valid payload for diffusible siret", async (t) => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () => Promise.resolve(CommunautéDeCommunes),
    });
    t.assert.snapshot(await getOrganizationInfo("20007184300060"));
  });

  test("should return valid payload for diffusible siren", async (t) => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.resolve(CommunautéDeCommunes),
      findBySiret: () => Promise.reject(),
    });
    t.assert.snapshot(await getOrganizationInfo("200071843"));
  });

  test("should show partial data for partially non diffusible établissement", async (t) => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
    });

    t.assert.snapshot(await getOrganizationInfo("94957325700019"));
  });

  test.skip("should throw for totally non diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () =>
        Promise.resolve({
          status_diffusion: "non_diffusible",
        } as InseeSiretEstablishment),
    });
    await assert.rejects(getOrganizationInfo("53512638700013"), NotFoundError);
  });
});
