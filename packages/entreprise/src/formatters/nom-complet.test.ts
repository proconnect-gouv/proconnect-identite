//

import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { formatNomComplet } from "./nom-complet.js";

//

suite(formatNomComplet.name, () => {
  const cases: [Parameters<typeof formatNomComplet>, string][] = [
    [
      [
        {
          denominationUniteLegale: "APPLE EUROPE INC.",
          nomUniteLegale: null,
          nomUsageUniteLegale: null,
          prenomUsuelUniteLegale: null,
          sigleUniteLegale: null,
        },
      ],
      "Apple europe inc.",
    ],
    [
      [
        {
          denominationUniteLegale: "COMMUNE DE CLAMART",
          nomUniteLegale: null,
          nomUsageUniteLegale: null,
          prenomUsuelUniteLegale: null,
          sigleUniteLegale: null,
        },
      ],
      "Commune de clamart",
    ],
    [
      [
        {
          denominationUniteLegale: "",
          nomUniteLegale: "DUTEIL",
          nomUsageUniteLegale: null,
          prenomUsuelUniteLegale: "DOUGLAS",
          sigleUniteLegale: null,
        },
      ],
      "Douglas Duteil",
    ],
    [
      [
        {
          denominationUniteLegale: "",
          nomUniteLegale: "DUTEIL",
          nomUsageUniteLegale: "VINCENT",
          prenomUsuelUniteLegale: "DOUGLAS",
          sigleUniteLegale: null,
        },
      ],
      "Douglas Vincent (Duteil)",
    ],
  ];

  for (const [parameters, expected] of cases) {
    test(`${expected}`, () => {
      const actual = formatNomComplet(...parameters);
      assert.equal(actual, expected);
    });
  }
});
