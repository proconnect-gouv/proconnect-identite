//

import {
  AppleEuropeInc,
  MaireClamart,
  Papillon,
  RogalDornEntrepreneur,
} from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";
import { suite, test } from "node:test";
import { toApiEntrepriseOrganizationInfo } from "./api_entreprise.js";

suite("toApiEntrepriseOrganizationInfo", () => {
  test("AppleEuropeInc", (t) => {
    const organization = toApiEntrepriseOrganizationInfo(AppleEuropeInc);
    t.assert.snapshot(organization);
  });

  test("Commune de clamart - Mairie", (t) => {
    const organization = toApiEntrepriseOrganizationInfo(MaireClamart);
    t.assert.snapshot(organization);
  });

  test("RogalDornEntrepreneur", (t) => {
    const organization = toApiEntrepriseOrganizationInfo(RogalDornEntrepreneur);
    t.assert.snapshot(organization);
  });
  test("Papillon", (t) => {
    const organization = toApiEntrepriseOrganizationInfo(Papillon);
    t.assert.snapshot(organization);
  });
});
