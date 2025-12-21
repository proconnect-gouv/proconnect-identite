import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check_session_auth } from "./checks.js";
import { run_checks } from "./run-checks.js";
import type { CheckFn } from "./types.js";

// Test helpers - simple pass/deny factories
const pass =
  <T extends string>(name: T): CheckFn<T, unknown> =>
  () => ({ type: "pass", name });

const deny =
  <T extends string>(name: T, code: string): CheckFn<T, unknown> =>
  () => ({ type: "deny", name, reason: { code } as never });

describe("run_checks", () => {
  describe("pipeline behavior", () => {
    it("passes when all checks pass", () => {
      const checks = [pass("a"), pass("b")] as const;

      const result = run_checks(checks, {});

      assert.deepEqual(result, { type: "pass" });
    });

    it("stops on first deny and returns the reason", () => {
      const checks = [pass("a"), deny("b", "some_error"), pass("c")] as const;

      const result = run_checks(checks, {});

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "some_error" },
      });
    });

    it("evaluates checks in order", () => {
      // If both would deny, the first one wins
      const checks = [
        deny("first", "error_1"),
        deny("second", "error_2"),
      ] as const;

      const result = run_checks(checks, {});

      assert.deepEqual(result, {
        type: "deny",
        reason: { code: "error_1" },
      });
    });
  });
});

describe("check_session_auth", () => {
  describe("when request uses auth headers (API-style)", () => {
    it("denies access - web routes don't accept API authentication", () => {
      const result = check_session_auth({ uses_auth_headers: true });

      assert.deepEqual(result, {
        type: "deny",
        name: "session_auth",
        reason: { code: "forbidden" },
      });
    });
  });

  describe("when request has no auth headers (normal browser request)", () => {
    it("passes - this is an anonymous web request", () => {
      const result = check_session_auth({ uses_auth_headers: false });

      assert.deepEqual(result, {
        type: "pass",
        name: "session_auth",
      });
    });
  });
});

describe("session_auth in pipeline", () => {
  const checks = [check_session_auth] as const;

  it("rejects API-style requests on web routes", () => {
    const result = run_checks(checks, { uses_auth_headers: true });

    assert.deepEqual(result, {
      type: "deny",
      reason: { code: "forbidden" },
    });
  });

  it("allows normal browser requests", () => {
    const result = run_checks(checks, { uses_auth_headers: false });

    assert.deepEqual(result, { type: "pass" });
  });
});
