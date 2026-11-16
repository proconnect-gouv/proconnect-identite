//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { closeMatchDiff } from "./activities.js";

//

const ulysse: Parameters<typeof closeMatchDiff>[0] = {
  birthcountry: "99100",
  birthdate: new Date("1992-09-07"),
  birthplace: "13055",
  family_name: "Tosi",
  gender: "male",
  given_name: "Ulysse",
};

describe("closeMatchDiff", () => {
  it("keeps only the differing criteria, as received and as compared", () => {
    assert.deepEqual(
      closeMatchDiff(ulysse, { ...ulysse, given_name: "Ulisse" }),
      {
        first_name: {
          franceconnect: { compared: "ULYSSE", raw: "Ulysse" },
          source: { compared: "ULISSE", raw: "Ulisse" },
        },
      },
    );
  });
});
