//

import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { formatTrancheEffectifsUniteLegale } from "./tranche-effectifs-unite-legale.js";

suite("formatTrancheEffectifsUniteLegale", { concurrency: true }, () => {
  const cases: [string | null | undefined, string][] = [
    ["NN", "Unité non employeuse"],
    ["00", "0 salarié"],
    ["01", "1 ou 2 salariés"],
    ["11", "10 à 19 salariés"],
    ["53", "10 000 salariés et plus"],
    [null, "Non renseigné"],
    [undefined, "Non renseigné"],
    ["XX", "Non renseigné"],
  ];

  for (const [code, expected] of cases) {
    test(`code "${code}" → "${expected}"`, () => {
      assert.equal(formatTrancheEffectifsUniteLegale(code), expected);
    });
  }
});
