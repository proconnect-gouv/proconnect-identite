//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatBirthdate } from "./birthdate.js";

//

describe("formatBirthdate", function () {
  const cases: [Parameters<typeof formatBirthdate>, Date][] = [
    [["00000000"], new Date(Date.UTC(0, -1, 0))],
    [["18991129"], new Date(Date.UTC(1899, 10, 29))],
    [["19800601"], new Date(Date.UTC(1980, 5, 1))],
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

  it("❎ fails with unexpected format", function () {
    assert.throws(
      () => formatBirthdate("1er avril 4444"),
      new Error(
        "Invalid date format. Expected YYYYMMDD. Actual: 1er avril 4444",
      ),
    );
  });
});
