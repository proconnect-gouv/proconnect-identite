import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mustReturnOneOrganizationInPayload } from "../src/services/must-return-one-organization-in-payload";

describe("mustReturnOneOrganizationInPayload", () => {
  it("should return true if organization is amongst the scopes", () => {
    assert.equal(
      mustReturnOneOrganizationInPayload("openid organization"),
      true,
    );
  });

  it("should return true even if organizationS id amongst the scopes", () => {
    assert.equal(
      mustReturnOneOrganizationInPayload("openid organizations organization"),
      true,
    );
  });

  it("should return true for ProConnect Federation required scopes", () => {
    assert.equal(
      mustReturnOneOrganizationInPayload(
        "openid uid given_name usual_name email siren siret organizational_unit belonging_population phone chorusdt idp_id idp_acr",
      ),
      true,
    );
  });

  it("should return false for DataPass required scopes", () => {
    assert.equal(
      mustReturnOneOrganizationInPayload(
        "openid email profile phone organizations",
      ),
      false,
    );
  });
});
