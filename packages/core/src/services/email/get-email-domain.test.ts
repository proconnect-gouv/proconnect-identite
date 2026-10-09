//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getEmailDomain } from "./get-email-domain.js";

//

describe("getEmailDomain", () => {
  const data = [
    {
      email: "user@beta.gouv.fr",
      domain: "beta.gouv.fr",
    },
    {
      email: "user@notaires.fr",
      domain: "notaires.fr",
    },
    {
      email: "user@subdomain.domain.org",
      domain: "subdomain.domain.org",
    },
    {
      email: "domain.org",
      domain: "domain.org",
    },
  ];

  data.forEach(({ email, domain }) => {
    it("should return email domain", () => {
      assert.equal(getEmailDomain(email), domain);
    });
  });

  const errors: { email: unknown; error: { name: string; message: RegExp } }[] =
    [
      {
        email: 1,
        error: { name: "TypeError", message: /Not a string/ },
      },
      {
        email: null,
        error: { name: "Error", message: /Not a string/ },
      },
      {
        email: "jean",
        error: { name: "Error", message: /Invalid TLD/ },
      },
    ];

  errors.forEach(({ email, error }) => {
    it(`should throw on ${JSON.stringify(email)}`, () => {
      assert.throws(() => getEmailDomain(email as string), error);
    });
  });
});
