import assert from "node:assert";
import { describe, it } from "node:test";
import { decide_access } from "./decide.js";

describe("decide_access", () => {
  describe("session_auth check", () => {
    it("denies when using auth headers", () => {
      const result = decide_access({ uses_auth_headers: true });
      assert.deepStrictEqual(result, {
        type: "deny",
        reason: { code: "forbidden" },
      });
    });

    it("passes when using session auth", () => {
      const result = decide_access({ uses_auth_headers: false });
      assert.deepStrictEqual(result, { type: "pass" });
    });

    it("passes with stop_after=session_auth", () => {
      const result = decide_access(
        { uses_auth_headers: false },
        "session_auth",
      );
      assert.deepStrictEqual(result, { type: "pass" });
    });
  });

  describe("user_connected check", () => {
    it("denies when user not connected", () => {
      const result = decide_access({
        uses_auth_headers: false,
        is_user_connected: false,
      });
      assert.deepStrictEqual(result, {
        type: "deny",
        reason: { code: "not_connected" },
      });
    });

    it("passes when user is connected", () => {
      const result = decide_access({
        uses_auth_headers: false,
        is_user_connected: true,
      });
      assert.deepStrictEqual(result, { type: "pass" });
    });

    it("passes with stop_after=user_connected", () => {
      const result = decide_access(
        {
          uses_auth_headers: false,
          is_user_connected: true,
        },
        "user_connected",
      );
      assert.deepStrictEqual(result, { type: "pass" });
    });

    it("continues checking when is_user_connected is undefined", () => {
      const result = decide_access({
        uses_auth_headers: false,
        is_user_connected: undefined,
      });
      assert.deepStrictEqual(result, { type: "pass" });
    });
  });

  describe("email_verified check", () => {
    it("denies when email verification renewal needed", () => {
      const result = decide_access({
        uses_auth_headers: false,
        is_user_connected: true,
        is_email_verified: true,
        needs_email_verification_renewal: true,
      });
      assert.deepStrictEqual(result, {
        type: "deny",
        reason: { code: "email_verification_renewal" },
      });
    });

    it("denies when email not verified", () => {
      const result = decide_access({
        uses_auth_headers: false,
        is_user_connected: true,
        is_email_verified: false,
      });
      assert.deepStrictEqual(result, {
        type: "deny",
        reason: { code: "email_not_verified" },
      });
    });

    it("denies with email_not_verified when email not verified even if renewal needed", () => {
      // This scenario happens during signup: email_verified=false but
      // needsEmailVerificationRenewal might return true due to null/old email_verified_at
      const result = decide_access({
        uses_auth_headers: false,
        is_user_connected: true,
        is_email_verified: false,
        needs_email_verification_renewal: true,
      });
      assert.deepStrictEqual(result, {
        type: "deny",
        reason: { code: "email_not_verified" },
      });
    });

    it("passes when email is verified and no renewal needed", () => {
      const result = decide_access({
        uses_auth_headers: false,
        is_user_connected: true,
        is_email_verified: true,
        needs_email_verification_renewal: false,
      });
      assert.deepStrictEqual(result, { type: "pass" });
    });

    it("passes with stop_after=email_verified", () => {
      const result = decide_access(
        {
          uses_auth_headers: false,
          is_user_connected: true,
          is_email_verified: true,
        },
        "email_verified",
      );
      assert.deepStrictEqual(result, { type: "pass" });
    });
  });

  describe("email_in_session check", () => {
    it("denies when no email in session", () => {
      const result = decide_access({
        uses_auth_headers: false,
        has_email_in_session: false,
      });
      assert.deepStrictEqual(result, {
        type: "deny",
        reason: { code: "no_email_in_session" },
      });
    });

    it("passes when email in session", () => {
      const result = decide_access({
        uses_auth_headers: false,
        has_email_in_session: true,
      });
      assert.deepStrictEqual(result, { type: "pass" });
    });

    it("passes with stop_after=email_in_session", () => {
      const result = decide_access(
        {
          uses_auth_headers: false,
          has_email_in_session: true,
        },
        "email_in_session",
      );
      assert.deepStrictEqual(result, { type: "pass" });
    });

    it("skips check when has_email_in_session is undefined (other middleware chains)", () => {
      // When called from user_connected or other chains, has_email_in_session
      // is not set - the check should be skipped
      const result = decide_access({
        uses_auth_headers: false,
        has_email_in_session: undefined,
      });
      assert.deepStrictEqual(result, { type: "pass" });
    });
  });

  describe("inclusionconnect_welcome check", () => {
    it("denies when needs inclusionconnect welcome", () => {
      const result = decide_access({
        uses_auth_headers: false,
        has_email_in_session: true,
        needs_inclusionconnect_welcome: true,
      });
      assert.deepStrictEqual(result, {
        type: "deny",
        reason: { code: "needs_inclusionconnect_welcome" },
      });
    });

    it("passes when doesn't need welcome page", () => {
      const result = decide_access({
        uses_auth_headers: false,
        has_email_in_session: true,
        needs_inclusionconnect_welcome: false,
      });
      assert.deepStrictEqual(result, { type: "pass" });
    });

    it("passes with stop_after=inclusionconnect_welcome when welcome not needed", () => {
      const result = decide_access(
        {
          uses_auth_headers: false,
          has_email_in_session: true,
          needs_inclusionconnect_welcome: false,
        },
        "inclusionconnect_welcome",
      );
      assert.deepStrictEqual(result, { type: "pass" });
    });

    it("skips check when needs_inclusionconnect_welcome is undefined", () => {
      const result = decide_access({
        uses_auth_headers: false,
        has_email_in_session: true,
        needs_inclusionconnect_welcome: undefined,
      });
      assert.deepStrictEqual(result, { type: "pass" });
    });
  });
});
