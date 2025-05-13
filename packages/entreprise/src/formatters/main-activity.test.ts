//

import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { formatMainActivity } from "./main-activity.js";

//

suite(formatMainActivity.name, () => {
  const cases: [Parameters<typeof formatMainActivity>, string][] = [
    [
      [
        {
          code: "01.13Z",
          nomenclature: "NAFRev2",
          libelle: "Culture de légumes, de melons, de racines et de tubercules",
        },
      ],
      "01.13Z - Culture de légumes, de melons, de racines et de tubercules",
    ],
    [
      [{ code: null, libelle: "▪︎ ▪︎ ▪︎", nomenclature: null }],
      "Activité inconnue",
    ],
  ];

  for (const [parameters, expected] of cases) {
    test(`${expected}`, () => {
      const actual = formatMainActivity(...parameters);
      assert.equal(actual, expected);
    });
  }
});
