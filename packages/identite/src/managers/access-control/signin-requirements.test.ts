import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { run_checks } from "./run-checks.js";
import {
  signin_requirements_checks,
  type SigninRequirementsContext,
} from "./signin-requirements.js";

function signin_context(
  overrides: Partial<SigninRequirementsContext> = {},
): SigninRequirementsContext {
  return {
    uses_auth_headers: false,
    is_within_authenticated_session: true,
    is_method_head: false,
    ...overrides,
  };
}

describe("signin_requirements_checks", () => {
  describe("when request uses API auth headers", () => {
    it("rejects with forbidden", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({ uses_auth_headers: true }),
      );
      assert.deepEqual(result, {
        type: "deny",
        name: "api_request_rejected",
        reason: { code: "forbidden" },
      });
    });
  });

  describe("when user is not authenticated", () => {
    it("redirects to sign-in", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({ is_within_authenticated_session: false }),
      );
      assert.deepEqual(result, {
        type: "deny",
        name: "session_missing",
        reason: { code: "not_connected" },
      });
    });

    it("passes if request method is HEAD (legacy behavior)", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({
          is_within_authenticated_session: false,
          is_method_head: true,
        }),
      );
      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("when request has no auth headers (normal browser request)", () => {
    it("allows access", () => {
      const result = run_checks(signin_requirements_checks, signin_context());
      assert.deepEqual(result, { type: "pass" });
    });
  });
});
