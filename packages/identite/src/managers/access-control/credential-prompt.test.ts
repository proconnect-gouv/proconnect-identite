import {
  credential_prompt_checks,
  run_checks,
  type CredentialPromptContext,
} from "#src/managers/access-control";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("credential_prompt_checks", () => {
  describe("session_auth check", () => {
    it("should deny if using auth headers", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: true,
        needs_inclusionconnect_welcome: false,
        uses_auth_headers: true,
      };

      const result = run_checks(credential_prompt_checks(ctx));

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "forbidden" },
      });
    });

    it("should pass session_auth when no auth headers", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: true,
        needs_inclusionconnect_welcome: false,
        uses_auth_headers: false,
      };

      const result = run_checks(credential_prompt_checks(ctx), "session_auth");

      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("email_in_session check", () => {
    it("should deny if no email in session", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: false,
        needs_inclusionconnect_welcome: false,
        uses_auth_headers: false,
      };

      const result = run_checks(credential_prompt_checks(ctx));

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "no_email_in_session" },
      });
    });

    it("should pass email_in_session when email is present", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: true,
        needs_inclusionconnect_welcome: false,
        uses_auth_headers: false,
      };

      const result = run_checks(
        credential_prompt_checks(ctx),
        "email_in_session",
      );

      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("inclusionconnect_welcome check", () => {
    it("should deny if user needs welcome page", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: true,
        needs_inclusionconnect_welcome: true,
        uses_auth_headers: false,
      };

      const result = run_checks(credential_prompt_checks(ctx));

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "needs_inclusionconnect_welcome" },
      });
    });

    it("should pass all checks when no welcome needed", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: true,
        needs_inclusionconnect_welcome: false,
        uses_auth_headers: false,
      };

      const result = run_checks(credential_prompt_checks(ctx));

      assert.deepEqual(result, { type: "pass" });
    });

    it("should stop at inclusionconnect_welcome when all conditions pass", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: true,
        needs_inclusionconnect_welcome: false,
        uses_auth_headers: false,
      };

      const result = run_checks(
        credential_prompt_checks(ctx),
        "inclusionconnect_welcome",
      );

      assert.deepEqual(result, { type: "pass" });
    });
  });

  describe("check ordering", () => {
    it("should check session_auth before email_in_session", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: false,
        needs_inclusionconnect_welcome: false,
        uses_auth_headers: true,
      };

      const result = run_checks(credential_prompt_checks(ctx));

      assert.equal(result.type, "deny");
      assert.equal(result.reason.code, "forbidden");
    });

    it("should check email_in_session before inclusionconnect_welcome", () => {
      const ctx: CredentialPromptContext = {
        has_email_in_session: false,
        needs_inclusionconnect_welcome: true,
        uses_auth_headers: false,
      };

      const result = run_checks(credential_prompt_checks(ctx));

      assert.equal(result.type, "deny");
      assert.equal(result.reason.code, "no_email_in_session");
    });
  });
});
