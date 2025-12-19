import {
  run_checks,
  signin_requirements_checks,
  type SigninRequirementsContext,
} from "#src/managers/access-control";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("signin_requirements_checks", () => {
  describe("session_auth check", () => {
    it("should deny if using auth headers", () => {
      const ctx: SigninRequirementsContext = {
        is_user_connected: true,
        uses_auth_headers: true,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "forbidden" },
      });
    });

    it("should pass session_auth when no auth headers", () => {
      const ctx: SigninRequirementsContext = {
        is_user_connected: true,
        uses_auth_headers: false,
      };

      const result = run_checks(
        signin_requirements_checks(ctx),
        "session_auth",
      );

      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("user_connected check", () => {
    it("should deny if user not connected", () => {
      const ctx: SigninRequirementsContext = {
        is_user_connected: false,
        uses_auth_headers: false,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "not_connected" },
      });
    });

    it("should pass user_connected when user is authenticated", () => {
      const ctx: SigninRequirementsContext = {
        is_user_connected: true,
        uses_auth_headers: false,
      };

      const result = run_checks(
        signin_requirements_checks(ctx),
        "user_connected",
      );

      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("email_verified check", () => {
    it("should deny if email not verified", () => {
      const ctx: SigninRequirementsContext = {
        is_email_verified: false,
        is_user_connected: true,
        uses_auth_headers: false,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "email_not_verified" },
      });
    });

    it("should deny if email verification renewal needed", () => {
      const ctx: SigninRequirementsContext = {
        is_email_verified: true,
        is_user_connected: true,
        needs_email_verification_renewal: true,
        uses_auth_headers: false,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "email_verification_renewal" },
      });
    });

    it("should pass when email is verified", () => {
      const ctx: SigninRequirementsContext = {
        is_email_verified: true,
        is_user_connected: true,
        uses_auth_headers: false,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.deepEqual(result, { type: "pass" });
    });

    it("should stop at email_verified when all conditions pass", () => {
      const ctx: SigninRequirementsContext = {
        is_email_verified: true,
        is_user_connected: true,
        uses_auth_headers: false,
      };

      const result = run_checks(
        signin_requirements_checks(ctx),
        "email_verified",
      );

      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("check ordering", () => {
    it("should check session_auth before user_connected", () => {
      const ctx: SigninRequirementsContext = {
        is_user_connected: false,
        uses_auth_headers: true,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.equal(result.type, "deny");
      assert.equal(result.reason.code, "forbidden");
    });

    it("should check user_connected before email_verified", () => {
      const ctx: SigninRequirementsContext = {
        is_email_verified: false,
        is_user_connected: false,
        uses_auth_headers: false,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.equal(result.type, "deny");
      assert.equal(result.reason.code, "not_connected");
    });

    it("should check email_verified renewal before basic email check", () => {
      const ctx: SigninRequirementsContext = {
        is_email_verified: true,
        is_user_connected: true,
        needs_email_verification_renewal: true,
        uses_auth_headers: false,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.equal(result.type, "deny");
      assert.equal(result.reason.code, "email_verification_renewal");
    });
  });

  describe("optional fields", () => {
    it("should handle undefined is_email_verified as truthy", () => {
      const ctx: SigninRequirementsContext = {
        is_user_connected: true,
        uses_auth_headers: false,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.deepEqual(result, { type: "pass" });
    });

    it("should handle undefined needs_email_verification_renewal", () => {
      const ctx: SigninRequirementsContext = {
        is_email_verified: true,
        is_user_connected: true,
        uses_auth_headers: false,
      };

      const result = run_checks(signin_requirements_checks(ctx));

      assert.deepEqual(result, { type: "pass" });
    });
  });
});
