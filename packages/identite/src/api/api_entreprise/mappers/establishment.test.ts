//

import {
  AppleEuropeInc,
  MaireClamart,
  RogalDornEntrepreneur,
} from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";
import { suite, test } from "node:test";
import { toOrganizationInfo } from "./establishment.js";

suite("fromSiret", () => {
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
});
