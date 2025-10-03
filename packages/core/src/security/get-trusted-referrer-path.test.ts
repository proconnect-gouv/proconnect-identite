//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTrustedReferrerPath } from "./get-trusted-referrer-path.js";

//

describe("getTrustedReferrerPath", () => {
  it("should not trust undefined referrer", () => {
    assert.equal(
      getTrustedReferrerPath(undefined, "https://proconnect.gouv.fr"),
      null,
    );
  });
  it("should not trust empty url", () => {
    assert.equal(
      getTrustedReferrerPath("", "https://proconnect.gouv.fr"),
      null,
    );
  });
  it("should not trust external domain (over https)", () => {
    assert.equal(
      getTrustedReferrerPath(
        "https://www.google.com",
        "https://proconnect.gouv.fr",
      ),
      null,
    );
  });
  it("should trust relative path", () => {
    assert.equal(
      getTrustedReferrerPath(
        "/users/join-organization",
        "https://proconnect.gouv.fr",
      ),
      "/users/join-organization",
    );
  });
  it("should trust absolute path on same domain", () => {
    assert.equal(
      getTrustedReferrerPath(
        "https://proconnect.gouv.fr/users/join-organization",
        "https://proconnect.gouv.fr",
      ),
      "/users/join-organization",
    );
  });
});
