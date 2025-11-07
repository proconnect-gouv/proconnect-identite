//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { distance } from "./distance.js";

//

describe("matching", () => {
  it("same Bernard", () => {
    assert.equal(
      distance(
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      0,
    );
  });

  it("Stéphane but DuMoulin", () => {
    assert.equal(
      distance(
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "DuMoulin",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      8,
    );
  });

  it("same Bernard but junior", () => {
    assert.equal(
      distance(
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthdate: new Date("1986-08-17"),
          birthplace: "MARS",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      14610,
    );
  });

  it("same Bernard but from VENUS", () => {
    assert.equal(
      distance(
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "VENUS",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      4,
    );
  });

  it("inverse Bernard", () => {
    assert.equal(
      distance(
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "Stéphane",
          gender: "male",
          given_name: "Bernard",
        },
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "Bernard",
          gender: "male",
          given_name: "Stéphane",
        },
      ),
      14,
    );
  });

  it("female Stéphane", () => {
    assert.equal(
      distance(
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "DuMoulin",
          gender: "male",
          given_name: "Stéphane",
        },
        {
          birthdate: new Date("1946-08-17"),
          birthplace: "MARS",
          family_name: "DuMoulin",
          gender: "female",
          given_name: "Stéphane",
        },
      ),
      1,
    );
  });
});
