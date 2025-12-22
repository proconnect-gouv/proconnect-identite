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
    should_force_2fa: false,
    two_factors_auth_requested: false,
    is_within_two_factor_authenticated_session: false,
    is_2fa_capable: false,
    is_browser_trusted: true,
    is_franceconnect_certification_requested: false,
    is_franceconnect_policy_override: false,
    is_user_verified_with_franceconnect: false,
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
        code: "forbidden",
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
        code: "not_connected",
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
        code: "user_not_found",
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
        code: "email_not_verified",
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
        code: "email_verification_renewal",
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
        code: "login_required",
      });
    });
  });

  describe("when 2FA is required but not completed", () => {
    it("redirects to 2FA page if user is 2FA capable", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({
          should_force_2fa: true,
          is_2fa_capable: true,
          is_within_two_factor_authenticated_session: false,
        }),
      );
      assert.deepEqual(result, {
        type: "deny",
        code: "two_factor_auth_required",
      });
    });

    it("redirects to choice page if user is NOT 2FA capable", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({
          should_force_2fa: true,
          is_2fa_capable: false,
          is_within_two_factor_authenticated_session: false,
        }),
      );
      assert.deepEqual(result, {
        type: "deny",
        code: "two_factor_choice_required",
      });
    });
  });

  describe("when browser is NOT trusted", () => {
    it("redirects to browser trust page", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({ is_browser_trusted: false }),
      );
      assert.deepEqual(result, {
        type: "deny",
        code: "browser_not_trusted",
      });
    });
  });

  describe("when FranceConnect certification is required but not completed", () => {
    it("redirects to FranceConnect certification page", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({
          is_franceconnect_certification_requested: true,
          is_user_verified_with_franceconnect: false,
        }),
      );
      assert.deepEqual(result, {
        type: "deny",
        code: "franceconnect_certification_required",
      });
    });

    it("passes if feature flag to consider all users as certified is enabled", () => {
      // In reality, the loader handles this by setting is_franceconnect_policy_override to true
      const result = run_checks(
        signin_requirements_checks,
        signin_context({
          is_franceconnect_certification_requested: true,
          is_user_verified_with_franceconnect: false,
          is_franceconnect_policy_override: true,
        }),
      );
      assert.deepEqual(result, { type: "pass" });
    });

    it("passes with franceconnect_identity_not_requested when not requested", () => {
      const result = run_checks(
        signin_requirements_checks,
        signin_context({
          is_franceconnect_certification_requested: false,
        }),
      );
      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("when all checks pass", () => {
    it("allows access", () => {
      const result = run_checks(signin_requirements_checks, signin_context());
      assert.deepEqual(result, { type: "pass" });
    });
  });
});
