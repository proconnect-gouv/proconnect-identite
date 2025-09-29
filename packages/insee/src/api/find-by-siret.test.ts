//

import { createInseeSirenePrivateOpenApiClient } from "#src/client";
import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";
import { findBySiretFactory } from "./find-by-siret.js";

//

suite("findBySiretFactory", () => {
  test("should return an establishment from a siret", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            header: { statut: 200 },
            etablissement: { siret: "🦄" },
          }),
        ),
      );
    });
    const client = createInseeSirenePrivateOpenApiClient(
      "__INSEE_API_TOKEN__",
      {
        fetch,
      },
    );
    const findBySiret = findBySiretFactory(client);

    const etablissement = await findBySiret("662042449");

    assert.equal(etablissement.siret, "🦄");
  });
});
