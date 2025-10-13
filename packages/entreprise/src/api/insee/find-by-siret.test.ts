//

import { createApiEntrepriseOpenApiClient } from "#src/client";
import { coolTrackingParams } from "#testing";
import { mock, suite, test } from "node:test";
import { findBySiretFactory } from "./find-by-siret.js";

//

suite(findBySiretFactory.name, () => {
  test("should return an establishment from a siret", async (t) => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(JSON.stringify({ data: { siret: "🦄" } })),
      );
    });
    const client = createApiEntrepriseOpenApiClient("SECRET_INSEE_TOKEN", {
      fetch,
    });
    const findBySiret = findBySiretFactory(client, coolTrackingParams);

    const establishment = await findBySiret("20007184300060");

    t.assert.equal(establishment.siret, "🦄");
  });
});
