//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { certificationScore } from "./certification-score.js";

//

describe("certification scoring", () => {
  it("perfect match - all 5 criteria", () => {
    // All criteria match: family name, first name, gender, birthdate, birthplace
    assert.equal(
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
      5,
    );
  });

  it("family name mismatch", () => {
    // Different family name = -1 point
    assert.equal(
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
      4,
    );
  });

  it("different birthdate", () => {
    // Different birthdate = -1 point
    assert.equal(
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
      4,
    );
  });

  it("different birthplace", () => {
    // Different birthplace = -1 point
    assert.equal(
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
      4,
    );
  });

  it("swapped first and family names", () => {
    // Both names don't match = -2 points
    assert.equal(
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
      3,
    );
  });

  it("different gender still matches when source gender is null", () => {
    // Gender is null in source = still gets point
    assert.equal(
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
      5,
    );
  });

  it("different gender when source has gender", () => {
    // Different gender = -1 point
    assert.equal(
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
      4,
    );
  });

  it("matches first name with hyphen normalization", () => {
    // Jean-Pierre and Jean Pierre should match (first name is "Jean")
    assert.equal(
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
      5,
    );
  });

  it("birthplace with commune code conversion", () => {
    // 75050 should convert to 92050
    assert.equal(
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
      5,
    );
  });

  it("null birthplace in source still matches", () => {
    // Null birthplace in source = still gets point
    assert.equal(
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
      5,
    );
  });

  it("foreign person with matching country", () => {
    // For foreigners, check country code
    assert.equal(
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
      5,
    );
  });

  it("foreign person with different country", () => {
    // Different country = -1 point
    assert.equal(
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
      4,
    );
  });
});
