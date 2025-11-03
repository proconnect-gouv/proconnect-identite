//

import {
  LiElJonsonEstablishment,
  RogalDornEstablishment,
} from "@proconnect-gouv/proconnect.insee/testing/seed/establishments";
import { suite, test } from "node:test";
import { toIdentityVector } from "./insee.js";

suite("toIdentityVector", () => {
  test("LiElJonsonEstablishment", (t) => {
    t.assert.snapshot(toIdentityVector(LiElJonsonEstablishment));
  });

  test("RogalDornEstablishment", (t) => {
    t.assert.snapshot(toIdentityVector(RogalDornEstablishment));
  });
});
