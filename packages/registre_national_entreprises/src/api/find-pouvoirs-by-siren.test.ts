//

import { RegistreNationalEntreprisesApiError } from "#src/types";
import { createRegistreNationalEntreprisesOpenApiClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/client";
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { findPouvoirsBySirenFactory } from "./find-pouvoirs-by-siren.js";

//

describe("findPouvoirsBySiren", () => {
  it("should return pouvoirs and the company update date for a valid SIREN", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            formality: {
              content: {
                personneMorale: {
                  composition: {
                    pouvoirs: [
                      {
                        typeDePersonne: "INDIVIDU",
                        actif: true,
                        individu: {
                          nom: "🦄",
                          prenom: "🐹",
                        },
                      },
                    ],
                  },
                },
              },
            },
            updatedAt: "2026-09-26T23:06:11+02:00",
          }),
        ),
      );
    });

    const client = createRegistreNationalEntreprisesOpenApiClient({
      fetch,
    });

    const findPouvoirsBySiren = findPouvoirsBySirenFactory(client);
    const result = await findPouvoirsBySiren("552032534");

    assert.deepEqual(result, {
      pouvoirs: [
        {
          typeDePersonne: "INDIVIDU",
          actif: true,
          individu: {
            nom: "🦄",
            prenom: "🐹",
          },
        },
      ],
      updated_at: "2026-09-26T23:06:11+02:00",
    });
  });

  it("should filter out inactive pouvoirs", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            formality: {
              content: {
                personneMorale: {
                  composition: {
                    pouvoirs: [
                      {
                        typeDePersonne: "INDIVIDU",
                        individu: {
                          nom: "Implicitly active",
                          prenom: "Person",
                        },
                      },
                      {
                        typeDePersonne: "INDIVIDU",
                        actif: true,
                        individu: {
                          nom: "Active",
                          prenom: "Person",
                        },
                      },
                      {
                        typeDePersonne: "INDIVIDU",
                        actif: false,
                        individu: {
                          nom: "Inactive",
                          prenom: "Person",
                        },
                      },
                      {
                        typeDePersonne: "MORALE",
                        actif: true,
                        individu: {
                          nom: "Company",
                          prenom: "Name",
                        },
                      },
                    ],
                  },
                },
              },
            },
          }),
        ),
      );
    });

    const client = createRegistreNationalEntreprisesOpenApiClient({
      fetch,
    });

    const findPouvoirsBySiren = findPouvoirsBySirenFactory(client);
    const result = await findPouvoirsBySiren("807612296");

    assert.deepEqual(result, {
      pouvoirs: [
        {
          typeDePersonne: "INDIVIDU",
          individu: {
            nom: "Implicitly active",
            prenom: "Person",
          },
        },
        {
          typeDePersonne: "INDIVIDU",
          actif: true,
          individu: {
            nom: "Active",
            prenom: "Person",
          },
        },
      ],
      updated_at: null,
    });
  });

  it("should throw RegistreNationalEntreprisesApiError on API error", async () => {
    const client = createRegistreNationalEntreprisesOpenApiClient({
      fetch: () =>
        Promise.resolve(
          new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }),
        ),
    });

    const findPouvoirsBySiren = findPouvoirsBySirenFactory(client);

    await assert.rejects(
      findPouvoirsBySiren("999999999"),
      RegistreNationalEntreprisesApiError,
    );
  });

  it("should return no pouvoirs and no update date when the company has neither", async () => {
    const client = createRegistreNationalEntreprisesOpenApiClient({
      fetch: () =>
        Promise.resolve(
          new Response(JSON.stringify({ formality: { content: {} } }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
    });

    const findPouvoirsBySiren = findPouvoirsBySirenFactory(client);
    const result = await findPouvoirsBySiren("123456789");

    assert.deepEqual(result, { pouvoirs: [], updated_at: null });
  });
});
