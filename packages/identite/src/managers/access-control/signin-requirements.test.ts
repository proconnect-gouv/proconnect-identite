import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { User } from "../../types/index.js";
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
    user: { id: 1, email_verified: true } as User,
    needs_email_verification_renewal: false,
    has_authenticated_recently: true,
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

  describe("when user was deleted but session exists", () => {
    it("destroys session (user not found)", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({ user: undefined }),
      );
      assert.deepEqual(result, {
        type: "deny",
        name: "user_not_found",
        reason: { code: "user_not_found" },
      });
    });
  });

  describe("when email is not verified", () => {
    it("redirects to verification page", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({
          user: { id: 1, email_verified: false } as User,
        }),
      );
      assert.deepEqual(result, {
        type: "deny",
        name: "email_unverified",
        reason: { code: "email_not_verified" },
      });
    });
  });

  describe("when email verification needs renewal", () => {
    it("redirects to verification page with notification", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({ needs_email_verification_renewal: true }),
      );
      assert.deepEqual(result, {
        type: "deny",
        name: "email_renewal_needed",
        reason: { code: "email_verification_renewal" },
      });
    });
  });

  describe("when user session is stale (authenticated too long ago)", () => {
    it("redirects to sign-in with login_required notification", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({ has_authenticated_recently: false }),
      );
      assert.deepEqual(result, {
        type: "deny",
        name: "session_stale",
        reason: { code: "login_required" },
      });
    });
  });

  describe("when all checks pass", () => {
    it("allows access", () => {
      const result = run_checks(signin_requirements_checks, signin_context());
      assert.deepEqual(result, { type: "pass" });
    });
  });
});
