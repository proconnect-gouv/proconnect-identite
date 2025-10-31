//

import { createRegistreNationalEntreprisesOpenApiClient } from "#src/client";
import {
  RegistreNationalEntreprisesApiError,
  type CompaniesSirenResponse,
} from "#src/types";
import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";
import { findBeneficiairesEffectifsBySirenFactory } from "./find-beneficiaires-effectifs-by-siren.js";

//

const TOKEN = "__REGISTRE_NATIONAL_ENTREPRISES_API_TOKEN__";

suite("findBeneficiairesEffectifsBySirenFactory", () => {
  test("should return an company from a siren", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            siren: "🦄",
            formality: {
              content: {
                personneMorale: {
                  beneficiairesEffectifs: [
                    { beneficiaire: { descriptionPersonne: { nom: "🤷" } } },
                  ],
                },
              },
            },
          } satisfies CompaniesSirenResponse),
        ),
      );
    });
    const client = createRegistreNationalEntreprisesOpenApiClient(TOKEN, {
      fetch,
    });
    const findBySiren = findBeneficiairesEffectifsBySirenFactory(client);

    const beneficiairesEffectifs = await findBySiren("791088917");

    assert.deepEqual(beneficiairesEffectifs, [
      {
        descriptionPersonne: { nom: "🤷" },
      },
    ]);
  });

  test("❎ fails not found", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            code: "404",
            message:
              'No route found for "GET https://registre-national-entreprises.inpi.fr/api/companies/%F0%9F%90%B4"',
            type: "invalidRequestError",
          }),
          {
            status: 404,
          },
        ),
      );
    });
    const client = createRegistreNationalEntreprisesOpenApiClient(TOKEN, {
      fetch,
    });
    const findBySiren = findBeneficiairesEffectifsBySirenFactory(client);

    await assert.rejects(
      findBySiren("🐴"),
      new RegistreNationalEntreprisesApiError({
        code: "404",
        message: `No route found for "GET https://registre-national-entreprises.inpi.fr/api/companies/%F0%9F%90%B4"`,
        type: "invalidRequestError",
      }),
    );
  });
});
