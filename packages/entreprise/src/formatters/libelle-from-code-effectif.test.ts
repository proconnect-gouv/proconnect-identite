//

import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { libelleFromCodeEffectif } from "./libelle-from-code-effectif.js";

//

suite(libelleFromCodeEffectif.name, () => {
  const cases: [Parameters<typeof libelleFromCodeEffectif>, string][] = [
    [[null, null], ""],
    [["1 ou 2 salariés", null], "1 ou 2 salariés"],
    [[null, "2222"], ""],
    [["1 ou 2 salariés", "2222"], "1 ou 2 salariés, en 2222"],
  ];

  for (const [parameters, expected] of cases) {
    test(`[${parameters}] = ${expected}`, () => {
      const actual = libelleFromCodeEffectif(...parameters);
      assert.equal(actual, expected);
    });
  }
});
