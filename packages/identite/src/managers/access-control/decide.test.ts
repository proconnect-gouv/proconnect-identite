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
});
