//

import {
  AppleEuropeInc,
  MaireClamart,
  RogalDornEntrepreneur,
} from "@gouvfr-lasuite/proconnect.entreprise/testing/seed/insee/siret";
import { suite, test } from "node:test";
import { fromSiret } from "./from-siret.js";

suite("fromSiret", () => {
  test("AppleEuropeInc", (t) => {
    const organization = fromSiret(AppleEuropeInc);
    t.assert.snapshot(organization);
  });

  test("Commune de clamart - Mairie", (t) => {
    const organization = fromSiret(MaireClamart);
    t.assert.snapshot(organization);
  });

  test("RogalDornEntrepreneur", (t) => {
    const organization = fromSiret(RogalDornEntrepreneur);
    t.assert.snapshot(organization);
  });
});
