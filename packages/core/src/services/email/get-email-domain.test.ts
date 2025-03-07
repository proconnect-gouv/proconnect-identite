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
  ];

  data.forEach(({ email, domain }) => {
    it("should return email domain", () => {
      assert.equal(getEmailDomain(email), domain);
    });
  });
});
