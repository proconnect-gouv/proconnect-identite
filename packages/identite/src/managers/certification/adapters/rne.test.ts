//

import {
  RogalDornPouvoir,
  UlysseTosiPouvoir,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/testing/seed";
import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { toIdentityVector } from "./rne.js";

suite("RNE adapter - toIdentityVector", () => {
  test("converts valid pouvoir with all fields", () => {
    const result = toIdentityVector(UlysseTosiPouvoir);

    assert.deepEqual(result, {
      birthdate: new Date(Date.UTC(1992, 8, 7)), // September (month 8) 7, 1992
      birthplace: "Internet",
      family_name: "TOSI",
      gender: "male",
      given_name: "Ulysse",
    });
  });

  test("converts pouvoir with multiple prenoms", () => {
    const pouvoir = {
      individu: {
        descriptionPersonne: {
          dateDeNaissance: "1985-06-15",
          lieuDeNaissance: "Paris",
          nom: "DUPONT",
          prenoms: ["Jean", "Paul", "Marie"],
          genre: "1",
        },
      },
    };

    const result = toIdentityVector(pouvoir);

    assert.equal(result.given_name, "Jean Paul Marie");
    assert.equal(result.family_name, "DUPONT");
    assert.equal(result.gender, "male");
  });

  test("handles invalid date format - returns null birthdate", () => {
    const pouvoir = {
      individu: {
        descriptionPersonne: {
          dateDeNaissance: "invalid-date",
          lieuDeNaissance: "Lyon",
          nom: "MARTIN",
          prenoms: ["Alice"],
        },
      },
    };

    const result = toIdentityVector(pouvoir);

    assert.equal(result.birthdate, null);
    assert.equal(result.family_name, "MARTIN");
  });

  test("handles missing optional fields - returns null", () => {
    const result = toIdentityVector({});

    assert.deepEqual(result, {
      birthdate: null,
      birthplace: null,
      family_name: null,
      gender: null,
      given_name: null,
    });
  });

  test("handles empty prenoms array", () => {
    const pouvoir = {
      individu: {
        descriptionPersonne: {
          dateDeNaissance: "1990-01-01",
          lieuDeNaissance: "Marseille",
          nom: "BERNARD",
          prenoms: [],
        },
      },
    };

    const result = toIdentityVector(pouvoir);

    assert.equal(result.given_name, "");
    assert.equal(result.family_name, "BERNARD");
  });

  test("handles far future date (RogalDorn from year 29000)", () => {
    const result = toIdentityVector(RogalDornPouvoir);

    // Year 29000 should be parsed correctly
    assert.deepEqual(result, {
      birthdate: new Date(Date.UTC(29000, 0, 7)), // January 7, 29000
      birthplace: "INWIT",
      family_name: "DORN",
      gender: "male",
      given_name: "ROGAL",
    });
  });

  test("handles partial date components", () => {
    const pouvoir = {
      individu: {
        descriptionPersonne: {
          dateDeNaissance: "2000-12-31",
          lieuDeNaissance: "Bordeaux",
          nom: "LAURENT",
          prenoms: ["Sophie"],
        },
      },
    };

    const result = toIdentityVector(pouvoir);

    assert.deepEqual(result.birthdate, new Date(Date.UTC(2000, 11, 31))); // December 31, 2000
  });

  test("handles undefined individu fields gracefully", () => {
    const pouvoir = {};

    const result = toIdentityVector(pouvoir);

    assert.deepEqual(result, {
      birthdate: null,
      birthplace: null,
      family_name: null,
      gender: null,
      given_name: null,
    });
  });

  test("maps genre 1 to male", () => {
    const pouvoir = {
      individu: {
        descriptionPersonne: {
          dateDeNaissance: "1990-01-01",
          lieuDeNaissance: "Paris",
          nom: "DUPONT",
          prenoms: ["Jean"],
          genre: "1",
        },
      },
    };

    const result = toIdentityVector(pouvoir);
    assert.equal(result.gender, "male");
  });

  test("maps genre 2 to female", () => {
    const pouvoir = {
      individu: {
        descriptionPersonne: {
          dateDeNaissance: "1990-01-01",
          lieuDeNaissance: "Paris",
          nom: "MARTIN",
          prenoms: ["Marie"],
          genre: "2",
        },
      },
    };

    const result = toIdentityVector(pouvoir);
    assert.equal(result.gender, "female");
  });

  test("returns null for unknown genre", () => {
    const pouvoir = {
      individu: {
        descriptionPersonne: {
          dateDeNaissance: "1990-01-01",
          lieuDeNaissance: "Paris",
          nom: "BERNARD",
          prenoms: ["Alex"],
          genre: "3",
        },
      },
    };

    const result = toIdentityVector(pouvoir);
    assert.equal(result.gender, null);
  });
});
