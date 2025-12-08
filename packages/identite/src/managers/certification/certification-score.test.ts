//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { certificationScore } from "./certification-score.js";

//

describe("certification scoring", () => {
  it("perfect match - all 5 criteria", () => {
    // All criteria match: family name, first name, gender, birthdate, birthplace
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      new Set([
        "family_name",
        "first_name",
        "gender",
        "birth_date",
        "birth_place",
      ]),
    );
  });

  it("family name mismatch", () => {
    // Different family name = missing family_name
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "DuMoulin",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      new Set(["first_name", "gender", "birth_date", "birth_place"]),
    );
  });

  it("different birthdate", () => {
    // Different birthdate = missing birth_date
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthcountry: null,
          birthdate: new Date("1986-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      new Set(["family_name", "first_name", "gender", "birth_place"]),
    );
  });

  it("different birthplace", () => {
    // Different birthplace = missing birth_place
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "13001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      new Set(["family_name", "first_name", "gender", "birth_date"]),
    );
  });

  it("swapped first and family names", () => {
    // Both names don't match = missing both name criteria
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Stéphane",
          gender: "male",
          given_name: "Bernard",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      new Set(["gender", "birth_date", "birth_place"]),
    );
  });

  it("different gender still matches when source gender is null", () => {
    // Gender is null in source = still gets gender match
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: null,
          given_name: "Stéphane",
        },
      ),
      new Set([
        "family_name",
        "first_name",
        "gender",
        "birth_date",
        "birth_place",
      ]),
    );
  });

  it("different gender when source has gender", () => {
    // Different gender = missing gender
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "female",
          given_name: "Stéphane",
        },
      ),
      new Set(["family_name", "first_name", "birth_date", "birth_place"]),
    );
  });

  it("matches first name with hyphen normalization", () => {
    // Jean-Pierre and Jean Marc should match (first name is "Jean")
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Jean-Pierre",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Jean Marc",
        },
      ),
      new Set([
        "family_name",
        "first_name",
        "gender",
        "birth_date",
        "birth_place",
      ]),
    );
  });

  it("birthplace with commune code conversion", () => {
    // 75050 should convert to 92050
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75050",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "92050",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      new Set([
        "family_name",
        "first_name",
        "gender",
        "birth_date",
        "birth_place",
      ]),
    );
  });

  it("null birthplace in source still matches", () => {
    // Null birthplace in source = still gets birth_place match
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: "75001",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthcountry: null,
          birthdate: new Date("1946-08-17"),
          birthplace: null,
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      new Set([
        "family_name",
        "first_name",
        "gender",
        "birth_date",
        "birth_place",
      ]),
    );
  });

  it("foreign person with matching country", () => {
    // For foreigners, check country code
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: "99136",
          birthdate: new Date("1946-08-17"),
          birthplace: null,
          family_name: "O'Connor",
          gender: "male",
          given_name: "Patrick",
        },
        {
          birthcountry: "99136",
          birthdate: new Date("1946-08-17"),
          birthplace: null,
          family_name: "O'Connor",
          gender: "male",
          given_name: "Patrick",
        },
      ),
      new Set([
        "family_name",
        "first_name",
        "gender",
        "birth_date",
        "birth_country",
      ]),
    );
  });

  it("foreign person with different country", () => {
    // Different country = missing birth_country
    assert.deepStrictEqual(
      certificationScore(
        {
          birthcountry: "99136", // Ireland
          birthdate: new Date("1946-08-17"),
          birthplace: null,
          family_name: "O'Connor",
          gender: "male",
          given_name: "Patrick",
        },
        {
          birthcountry: "99132", // UK
          birthdate: new Date("1946-08-17"),
          birthplace: null,
          family_name: "O'Connor",
          gender: "male",
          given_name: "Patrick",
        },
      ),
      new Set(["family_name", "first_name", "gender", "birth_date"]),
    );
  });
});
