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

  describe("when authenticated user with valid session", () => {
    it("allows access", () => {
      const result = run_checks(signin_requirements_checks, signin_context());
      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("check ordering", () => {
    it("checks session_auth before user_connected", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({
          uses_auth_headers: true,
          is_within_authenticated_session: false,
        }),
      );
      assert.deepEqual(result, {
        type: "deny",
        name: "api_request_rejected",
        reason: { code: "forbidden" },
      });
    });
  });
});
