//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getTrustedReferrerPathFromRequest,
  type RequestLike,
} from "./get-trusted-referrer-path-from-request.js";

//

const base = "https://proconnect.gouv.fr";

function createRequest({
  method = "GET",
  originalUrl = "/",
  referrer,
}: {
  method?: string;
  originalUrl?: string;
  referrer?: string;
}): RequestLike {
  return {
    method,
    originalUrl,
    get: (name) => (name === "Referrer" ? referrer : undefined),
  };
}

describe("getTrustedReferrerPathFromRequest", () => {
  it("should use the original url on GET requests", () => {
    assert.equal(
      getTrustedReferrerPathFromRequest(
        createRequest({
          originalUrl: "/users/join-organization?siret=123",
          referrer: `${base}/users/personal-information`,
        }),
        base,
      ),
      "/users/join-organization?siret=123",
    );
  });
  it("should use the referrer header on POST requests", () => {
    assert.equal(
      getTrustedReferrerPathFromRequest(
        createRequest({
          method: "POST",
          originalUrl: "/users/join-organization",
          referrer: `${base}/users/personal-information`,
        }),
        base,
      ),
      "/users/personal-information",
    );
  });
  it("should not trust a referrer header from an external domain", () => {
    assert.equal(
      getTrustedReferrerPathFromRequest(
        createRequest({
          method: "POST",
          originalUrl: "/users/join-organization",
          referrer: "https://www.google.com/search",
        }),
        base,
      ),
      undefined,
    );
  });
  it("should return undefined on POST requests without referrer header", () => {
    assert.equal(
      getTrustedReferrerPathFromRequest(
        createRequest({
          method: "POST",
          originalUrl: "/users/join-organization",
        }),
        base,
      ),
      undefined,
    );
  });
});
