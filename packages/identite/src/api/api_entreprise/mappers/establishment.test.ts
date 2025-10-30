//

import {
  AppleEuropeInc,
  MaireClamart,
  Papillon,
  RogalDornEntrepreneur,
} from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";
import { suite, test } from "node:test";
import { toOrganizationInfo } from "./establishment.js";

suite("toOrganizationInfo", () => {
  test("AppleEuropeInc", (t) => {
    const organization = toOrganizationInfo(AppleEuropeInc);
    t.assert.snapshot(organization);
  });

  test("Commune de clamart - Mairie", (t) => {
    const organization = toOrganizationInfo(MaireClamart);
    t.assert.snapshot(organization);
  });

  test("RogalDornEntrepreneur", (t) => {
    const organization = toOrganizationInfo(RogalDornEntrepreneur);
    t.assert.snapshot(organization);
  });
  test("Papillon", (t) => {
    const organization = toOrganizationInfo(Papillon);
    t.assert.snapshot(organization);
  });
});
