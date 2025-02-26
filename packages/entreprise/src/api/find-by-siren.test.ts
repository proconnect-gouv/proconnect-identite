//

import { createEntrepriseOpenApiClient } from "#src/client";
import { coolTrackingParams } from "#src/testing";
import { mock, suite, test } from "node:test";
import { findBySirenFactory } from "./find-by-siren.js";

//

suite(findBySirenFactory.name, () => {
  test("should return an establishment from a siren", async (t) => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(JSON.stringify({ data: { siret: "🦄" } })),
      );
    });
    const client = createEntrepriseOpenApiClient("SECRET_INSEE_TOKEN", {
      fetch,
    });
    const findBySiren = findBySirenFactory(client, coolTrackingParams);

    const establishment = await findBySiren("791088917");

    t.assert.equal(establishment.siret, "🦄");
  });
});
