//

import { createInseeSirenePrivateOpenApiClient } from "#src/client";
import { InseeApiError } from "#src/types";
import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";
import { findUniteLegaleBySirenFactory } from "./find-by-siren.js";

//

suite("findBySirenFactory", () => {
  test("should return an establishment from a siret", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            header: { statut: 200 },
            uniteLegale: {
              prenom1UniteLegale: "🐹",
              periodesUniteLegale: [{ dateFin: null, nomUniteLegale: "🦄" }],
            },
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
    const findUniteLegaleBySiret = findUniteLegaleBySirenFactory(client);

    const uniteLegale = await findUniteLegaleBySiret("662042449");

    assert.deepEqual(uniteLegale, {
      prenom1UniteLegale: "🐹",
      periodesUniteLegale: [{ dateFin: null, nomUniteLegale: "🦄" }],
    });
  });

  test("❎ fails if not active period found", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            header: { statut: 200 },
            uniteLegale: {
              prenom1UniteLegale: "🐹",
              periodesUniteLegale: [
                { dateFin: "2023-01-01", nomUniteLegale: "🦄" },
              ],
            },
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
    const findUniteLegaleBySiret = findUniteLegaleBySirenFactory(client);

    await assert.rejects(
      findUniteLegaleBySiret("♨️"),
      new InseeApiError({
        header: {
          statut: 409,
          message: "Not active periode with nomUniteLegale",
        },
      }),
    );
  });
});
