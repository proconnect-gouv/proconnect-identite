//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Domain } from "./domain.js";

//

describe("Domain", () => {
  it("should reject a domain parse_host throws on", () => {
    assert.throws(() => Domain.parse("example.notatld"), {
      name: "ZodError",
      issues: [
        {
          code: "custom",
          message: "unknown TLD",
          params: {
            cause: new Error(
              'Invalid TLD {"parts":["example","notatld"],"tld_level":-1,"allowUnknownTLD":false}',
            ),
          },
          path: [],
        },
      ],
    });
  });
});
