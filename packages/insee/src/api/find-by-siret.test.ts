//

import { createInseeSirenePrivateOpenApiClient } from "#src/client";
import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";
import { findUniteLegaleBySiretFactory } from "./find-by-siret.js";

//

suite("findBySiretFactory", () => {
  test("should return an establishment from a siret", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            header: { statut: 200 },
            etablissement: { uniteLegale: { nomUniteLegale: "🦄" } },
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
    const findUniteLegaleBySiret = findUniteLegaleBySiretFactory(client);

    const uniteLegale = await findUniteLegaleBySiret("662042449");

    assert.equal(uniteLegale.nomUniteLegale, "🦄");
  });
});
