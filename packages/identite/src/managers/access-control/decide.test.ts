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
});
