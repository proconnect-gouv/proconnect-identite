//

import { createApiEntrepriseOpenApiClient } from "#src/client";
import { coolTrackingParams } from "#testing";
import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";
import { findBySirenFactory } from "./find-by-siren.js";

//

suite("findBySirenFactory", () => {
  test("should return an establishment from a siren", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(JSON.stringify({ data: { siret: "🦄" } })),
      );
    });
    const client = createApiEntrepriseOpenApiClient("SECRET_INSEE_TOKEN", {
      fetch,
    });
    const findBySiren = findBySirenFactory(client, coolTrackingParams);

    const establishment = await findBySiren("791088917");

    assert.equal(establishment.siret, "🦄");
  });
});
