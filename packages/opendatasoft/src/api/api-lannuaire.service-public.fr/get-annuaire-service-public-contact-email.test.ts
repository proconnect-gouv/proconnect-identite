//

import {
  createOpendatasoftOpenApiClient,
  type OpendatasoftOpenApiClient,
} from "#src/client";
import {
  ApiOpendatasoftConnectionError,
  ApiOpendatasoftNotFoundError,
  ApiOpendatasoftUnprocessableEntityError,
  type ApiLannuaireAdministrationRecords,
  type ApiOpendatasoftResponseBadRequestError,
} from "#src/types";
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { getAnnuaireServicePublicContactEmailFactory } from "./get-annuaire-service-public-contact-email.js";

//

describe("getAnnuaireServicePublicContactEmail", () => {
  it("should return a valid email", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 1,
            results: [{ adresse_courriel: "administration@aurillac.fr" }],
          } as ApiLannuaireAdministrationRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://api-lannuaire.service-public.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireServicePublicContactEmail =
      getAnnuaireServicePublicContactEmailFactory(client);

    assert.equal(
      await getAnnuaireServicePublicContactEmail("15014", "15000"),
      "administration@aurillac.fr",
    );
  });

  it("should return valid email for two mairies with the same Code Officiel Geographique", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 2,
            results: [
              {
                adresse_courriel: "venosc@mairie2alpes.fr",
                adresse: JSON.stringify([{ code_postal: "38520" }]),
              },
              {
                adresse_courriel: "accueil@mairie2alpes.fr",
                adresse: JSON.stringify([{ code_postal: "38860" }]),
              },
            ],
          } as ApiLannuaireAdministrationRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://api-lannuaire.service-public.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireServicePublicContactEmail =
      getAnnuaireServicePublicContactEmailFactory(client);

    assert.equal(
      await getAnnuaireServicePublicContactEmail("38253", "38860"),
      "accueil@mairie2alpes.fr",
    );
  });

  it("should throw an error for invalid cog", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 0,
            results: [],
          } as ApiLannuaireAdministrationRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://api-lannuaire.service-public.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireServicePublicContactEmail =
      getAnnuaireServicePublicContactEmailFactory(client);

    await assert.rejects(
      getAnnuaireServicePublicContactEmail("00000", "00000"),
      ApiOpendatasoftNotFoundError,
    );
  });

  it("❎ fail with null codeOfficielGeographique", async () => {
    const getAnnuaireServicePublicContactEmail =
      getAnnuaireServicePublicContactEmailFactory(
        {} as OpendatasoftOpenApiClient,
      );
    await assert.rejects(
      getAnnuaireServicePublicContactEmail(null, "00000"),
      ApiOpendatasoftNotFoundError,
    );
  });

  it("❎ fail with http error", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            error_code: "ODSQLSyntaxError",
            message: "💣",
          } as ApiOpendatasoftResponseBadRequestError),
          { status: 400 },
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://api-lannuaire.service-public.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireServicePublicContactEmail =
      getAnnuaireServicePublicContactEmailFactory(client);
    await assert.rejects(
      getAnnuaireServicePublicContactEmail("🗺️", null),
      new ApiOpendatasoftConnectionError(""),
    );
  });

  it("❎ fail without postal code", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 2,
            results: [{}, {}],
          } as ApiLannuaireAdministrationRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://api-lannuaire.service-public.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireServicePublicContactEmail =
      getAnnuaireServicePublicContactEmailFactory(client);

    await assert.rejects(
      getAnnuaireServicePublicContactEmail("🗺️", null),
      new ApiOpendatasoftUnprocessableEntityError(
        "Without postal code, we cannot choose a mairie between 2 results.",
      ),
    );
  });

  it("❎ fail with no pair found", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 2,
            results: [
              { adresse: JSON.stringify([{ code_postal: "🌁" }]) },
              { adresse: JSON.stringify([{ code_postal: "🛝" }]) },
            ],
          } as ApiLannuaireAdministrationRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://api-lannuaire.service-public.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireServicePublicContactEmail =
      getAnnuaireServicePublicContactEmailFactory(client);

    await assert.rejects(
      getAnnuaireServicePublicContactEmail("🗺️", "⛩️"),
      new ApiOpendatasoftNotFoundError(
        "No pair found for (codeOfficielGeographique: 🗺️, codePostal: ⛩️).",
      ),
    );
  });

  it("❎ fail with invalid email address.", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 1,
            results: [{ adresse_courriel: "📺" }],
          } as ApiLannuaireAdministrationRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://api-lannuaire.service-public.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireServicePublicContactEmail =
      getAnnuaireServicePublicContactEmailFactory(client);

    await assert.rejects(
      getAnnuaireServicePublicContactEmail("🗺️", null),
      new ApiOpendatasoftUnprocessableEntityError(
        "📺 is not a valid email address.",
      ),
    );
  });
});
