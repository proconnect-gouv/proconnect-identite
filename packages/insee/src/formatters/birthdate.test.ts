//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatBirthdate } from "./birthdate.js";

//

describe("formatBirthdate", function () {
  const cases: [Parameters<typeof formatBirthdate>, Date][] = [
    [["18991129"], new Date("1899-11-29")],
    [["19800601"], new Date("1980-06-01")],
  ];

  for (const [parameters, expected] of cases) {
    it(`[${parameters}] = ${expected}`, () => {
      const actual = formatBirthdate(...parameters);
      assert.equal(actual.toISOString(), expected.toISOString());
    });
  }

  it("❎ fails with empty string", function () {
    assert.throws(
      () => formatBirthdate(""),
      new Error("Invalid date format. Expected YYYYMMDD. Actual: "),
    );
  });
  it("❎ fails with invalid date", function () {
    assert.throws(
      () => formatBirthdate("00000000"),
      new Error("Invalid date format. 0000-00-00"),
    );
  });
  it("❎ fails with unexpected format", function () {
    assert.throws(
      () => formatBirthdate("1er avril 4444"),
      new Error(
        "Invalid date format. Expected YYYYMMDD. Actual: 1er avril 4444",
      ),
    );
  });
});
