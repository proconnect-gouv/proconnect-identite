import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { containsEssentialAcrs } from "./contains-essential-acrs.js";

describe("containsEssentialAcrs", () => {
  const cases: [
    string,
    Parameters<typeof containsEssentialAcrs>,
    ReturnType<typeof containsEssentialAcrs>,
  ][] = [
    [
      "should return true for essential_acr reasons",
      [
        {
          details: {
            acr: {
              essential: true,
              value: "https://proconnect.gouv.fr/assurance/self-asserted",
            },
          },
          name: "login",
          reasons: ["essential_acr"],
        },
      ],
      true,
    ],
    [
      "should return true for essential_acrs reasons",
      [
        {
          details: {
            acr: {
              essential: true,
              values: [
                "https://proconnect.gouv.fr/assurance/self-asserted",
                "https://proconnect.gouv.fr/assurance/consistency-checked",
              ],
            },
          },
          name: "login",
          reasons: ["essential_acrs"],
        },
      ],
      true,
    ],
    [
      "should return false for unknown 💁 login name",
      [{ details: { acr: {} }, name: "💁", reasons: [] }],
      false,
    ],
    [
      "should return false for non unknown 🦆 reasons",
      [{ details: {}, name: "login", reasons: ["🦆"] }],
      false,
    ],
  ];

  for (const [title, parameters, expected] of cases) {
    it(title, () => {
      assert.equal(containsEssentialAcrs(...parameters), expected);
    });
  }
});
