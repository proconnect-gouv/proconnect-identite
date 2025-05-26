//

import { createEntrepriseOpenApiClient } from "#src/client";
import { coolTrackingParams } from "#src/testing";
import { EntrepriseApiError } from "#src/types";
import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";
import { findMandatairesSociauxBySirenFactory } from "./find-mandataires-sociaux-by-siren.js";

//

suite("findMandatairesSociauxBySirenFactory", () => {
  test("should return an array of mandataires from a siren", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: [
              {
                data: {
                  fonction: "Phaeron",
                  nom: "THE STORMLORD",
                  type: "personne_physique",
                  prenom: "IMOTEKH",
                  date_naissance: "2023-01-20",
                  date_naissance_timestamp: 1674172800,
                  lieu_naissance: "SAUTEKH TOMB WORLD",
                  pays_naissance: "NECRONTYR",
                  code_pays_naissance: "NC",
                  nationalite: "NECRON",
                  code_nationalite: "NC",
                },
                links: {
                  organization: 1,
                },
                meta: {
                  dynasty: "Sautekh",
                },
              },
              {
                data: {
                  fonction: "Archaeologist",
                  nom: "THE INFINITE",
                  type: "personne_physique",
                  prenom: "TRAZYN",
                  date_naissance: "2023-02-25",
                  date_naissance_timestamp: 1677283200,
                  lieu_naissance: "NIHILAKH TOMB WORLD",
                  pays_naissance: "NECRONTYR",
                  code_pays_naissance: "NC",
                  nationalite: "NECRON",
                  code_nationalite: "NC",
                },
                links: {
                  organization: 2,
                },
                meta: {
                  dynasty: "Nihilakh",
                },
              },
              {
                data: {
                  fonction: "Chapter Master",
                  nom: "CALGAR",
                  type: "personne_physique",
                  prenom: "MARNEUS",
                  date_naissance: "2023-06-20",
                  date_naissance_timestamp: 1687219200,
                  lieu_naissance: "MACRAGGE",
                  pays_naissance: "ULTRAMAR",
                  code_pays_naissance: "UM",
                  nationalite: "IMPERIAL",
                  code_nationalite: "IM",
                },
                links: {
                  organization: 5,
                },
                meta: {
                  chapter: "Ultramarines",
                },
              },
              {
                data: {
                  fonction: "Daemon Primarch",
                  nom: "PRIMARCH",
                  type: "personne_physique",
                  prenom: "MORTARION",
                  date_naissance: "2023-07-25",
                  date_naissance_timestamp: 1690243200,
                  lieu_naissance: "BARBARUS",
                  pays_naissance: "EYE OF TERROR",
                  code_pays_naissance: "ET",
                  nationalite: "CHAOS",
                  code_nationalite: "CH",
                },
                links: {},
                meta: {
                  legion: "Death Guard",
                },
              },
            ],
            meta: {
              personnes_physiques_count: 4,
              personnes_morales_count: 0,
              count: 4,
            },
            links: {},
          }),
        ),
      );
    });
    const client = createEntrepriseOpenApiClient("SECRET_INSEE_TOKEN", {
      fetch,
    });
    const findBySiren = findMandatairesSociauxBySirenFactory(
      client,
      coolTrackingParams,
    );

    const mandataires = await findBySiren("791088917");

    assert.equal(mandataires.length, 4);
    assert.equal(mandataires.at(0)?.prenom, "IMOTEKH");
  });

  test("fail with an EntrepriseApiError", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            errors: [
              {
                code: "02003",
                title: "Entité non trouvée",
                detail:
                  "Le siren indiqué n'existe pas, n'est pas connu ou ne comporte aucune information pour cet appel. Veuillez vérifier que l'identifiant correspond au périmètre couvert par l'API.",
                meta: {
                  provider: "Infogreffe",
                  provider_error: {
                    code: "006",
                    message: "DOSSIER NON TROUVE DANS LA BASE DE GREFFES",
                  },
                },
              },
            ],
          }),
          { status: 404 },
        ),
      );
    });
    const client = createEntrepriseOpenApiClient("SECRET_INSEE_TOKEN", {
      fetch,
    });
    const findBySiren = findMandatairesSociauxBySirenFactory(
      client,
      coolTrackingParams,
    );

    await assert.rejects(findBySiren("791088917"), EntrepriseApiError);
  });
});
