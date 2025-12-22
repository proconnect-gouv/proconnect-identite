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
    has_authenticated_recently: true,
    is_2fa_capable: false,
    is_browser_trusted: true,
    is_franceconnect_certification_requested: false,
    is_franceconnect_policy_override: false,
    is_method_head: false,
    is_user_verified_with_franceconnect: false,
    is_within_authenticated_session: true,
    is_within_two_factor_authenticated_session: false,
    must_return_one_organization: false,
    needs_email_verification_renewal: false,
    organizations: [{ id: 1 }] as any[],
    should_force_2fa: false,
    two_factors_auth_requested: false,
    user: {
      id: 1,
      email_verified: true,
      family_name: "Doe",
      given_name: "John",
    } as User,
    uses_auth_headers: false,
    ...overrides,
  };
}

describe("signin_requirements_checks", () => {
  describe("when request uses API auth headers", () => {
    it("rejects with forbidden", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({ uses_auth_headers: true }),
      );
      assert.deepEqual(result, {
        code: "forbidden",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when user is not authenticated", () => {
    it("redirects to sign-in", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({ is_within_authenticated_session: false }),
      );
      assert.deepEqual(result, {
        code: "not_connected",
        effects: [],
        type: "deny",
      });
    });

    it("passes if request method is HEAD (legacy behavior)", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({
          is_method_head: true,
          is_within_authenticated_session: false,
        }),
      );
      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("when user was deleted but session exists", () => {
    it("destroys session (user not found)", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({ user: undefined }),
      );
      assert.deepEqual(result, {
        code: "user_not_found",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when email is not verified", () => {
    it("redirects to verification page", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({
          user: { id: 1, email_verified: false } as User,
        }),
      );
      assert.deepEqual(result, {
        code: "email_not_verified",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when email verification needs renewal", () => {
    it("redirects to verification page with notification", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({ needs_email_verification_renewal: true }),
      );
      assert.deepEqual(result, {
        code: "email_verification_renewal",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when user session is stale (authenticated too long ago)", () => {
    it("redirects to sign-in with login_required notification", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({ has_authenticated_recently: false }),
      );
      assert.deepEqual(result, {
        code: "login_required",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when 2FA is required but not completed", () => {
    it("redirects to 2FA page if user is 2FA capable", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({
          is_2fa_capable: true,
          is_within_two_factor_authenticated_session: false,
          should_force_2fa: true,
        }),
      );
      assert.deepEqual(result, {
        code: "two_factor_auth_required",
        effects: [],
        type: "deny",
      });
    });

    it("redirects to choice page if user is NOT 2FA capable", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({
          is_2fa_capable: false,
          is_within_two_factor_authenticated_session: false,
          should_force_2fa: true,
        }),
      );
      assert.deepEqual(result, {
        code: "two_factor_choice_required",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when browser is NOT trusted", () => {
    it("redirects to browser trust page", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({ is_browser_trusted: false }),
      );
      assert.deepEqual(result, {
        code: "browser_not_trusted",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when FranceConnect certification is required but not completed", () => {
    it("redirects to FranceConnect certification page", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({
          is_franceconnect_certification_requested: true,
          is_user_verified_with_franceconnect: false,
        }),
      );
      assert.deepEqual(result, {
        code: "franceconnect_certification_required",
        effects: [],
        type: "deny",
      });
    });

    it("passes if feature flag to consider all users as certified is enabled", async () => {
      // In reality, the loader handles this by setting is_franceconnect_policy_override to true
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({
          is_franceconnect_certification_requested: true,
          is_franceconnect_policy_override: true,
          is_user_verified_with_franceconnect: false,
        }),
      );
      assert.deepEqual(result, { type: "pass" });
    });

    it("passes with franceconnect_identity_not_requested when not requested", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({
          is_franceconnect_certification_requested: false,
        }),
      );
      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("when profile is incomplete", () => {
    it("redirects to personal information page", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({
          user: {
            email_verified: true,
            family_name: "Doe",
            given_name: null,
            id: 1,
          } as any,
        }),
      );
      assert.deepEqual(result, {
        code: "personal_info_missing",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when user has no organization", () => {
    it("redirects to join organization page", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context({ organizations: [] }),
      );
      assert.deepEqual(result, {
        code: "organization_required",
        effects: [],
        type: "deny",
      });
    });
  });

  describe("when all checks pass", () => {
    it("allows access", async () => {
      const result = await run_checks(
        signin_requirements_checks,
        signin_context(),
      );
      assert.deepEqual(result, { type: "pass" });
    });
  });
});
