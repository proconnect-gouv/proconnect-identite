//

import { createEntrepriseOpenApiClient } from "#src/client";
import { coolTrackingParams } from "#src/testing";
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
});
