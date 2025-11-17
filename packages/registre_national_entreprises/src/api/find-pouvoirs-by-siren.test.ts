//

import { RegistreNationalEntreprisesApiError } from "#src/types";
import { createRegistreNationalEntreprisesOpenApiClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/client";
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { findPouvoirsBySirenFactory } from "./find-pouvoirs-by-siren.js";

//

describe("findPouvoirsBySiren", () => {
  it("should return pouvoirs for a valid SIREN", async () => {
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
          }),
        ),
      );
    });

    const client = createRegistreNationalEntreprisesOpenApiClient(
      "__RNE_API_TOKEN__",
      {
        fetch,
      },
    );

    const findPouvoirsBySiren = findPouvoirsBySirenFactory(client);
    const pouvoirs = await findPouvoirsBySiren("552032534");

    assert.deepEqual(pouvoirs, [
      {
        typeDePersonne: "INDIVIDU",
        actif: true,
        individu: {
          nom: "🦄",
          prenom: "🐹",
        },
      },
    ]);
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

    const client = createRegistreNationalEntreprisesOpenApiClient(
      "__RNE_API_TOKEN__",
      {
        fetch,
      },
    );

    const findPouvoirsBySiren = findPouvoirsBySirenFactory(client);
    const pouvoirs = await findPouvoirsBySiren("807612296");

    // Should only return active pouvoirs
    assert.deepEqual(pouvoirs, [
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
    ]);
  });

  it("should throw RegistreNationalEntreprisesApiError on API error", async () => {
    const client = createRegistreNationalEntreprisesOpenApiClient(
      "__RNE_API_TOKEN__",
      {
        fetch: () =>
          Promise.resolve(
            new Response(JSON.stringify({ error: "Not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }),
          ),
      },
    );

    const findPouvoirsBySiren = findPouvoirsBySirenFactory(client);

    await assert.rejects(
      findPouvoirsBySiren("999999999"),
      RegistreNationalEntreprisesApiError,
    );
  });

  it("should return empty array when no composition data", async () => {
    const client = createRegistreNationalEntreprisesOpenApiClient(
      "__RNE_API_TOKEN__",
      {
        fetch: () =>
          Promise.resolve(
            new Response(JSON.stringify({ formality: { content: {} } }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          ),
      },
    );

    const findPouvoirsBySiren = findPouvoirsBySirenFactory(client);
    const pouvoirs = await findPouvoirsBySiren("123456789");

    assert.deepEqual(pouvoirs, []);
  });
});
