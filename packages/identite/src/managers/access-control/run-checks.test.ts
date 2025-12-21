import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
        name: "b",
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
        name: "first",
        reason: { code: "error_1" },
      });
    });
  });

  describe("break_on option (pipeline checkpoints)", () => {
    it("stops after a specific pass name", () => {
      const checks = [pass("a"), pass("b"), pass("c")] as const;

      const result = run_checks(checks, {}, { break_on: "b" });

      assert.deepEqual(result, { type: "pass" });
    });

    it("still denies if deny occurs before break_on", () => {
      const checks = [pass("a"), deny("b", "error"), pass("c")] as const;

      const result = run_checks(checks, {}, { break_on: "c" });

      assert.deepEqual(result, {
        type: "deny",
        name: "b",
        reason: { code: "error" },
      });
    });

    it("runs all checks when break_on is not provided", () => {
      let executed: string[] = [];
      const track =
        <T extends string>(name: T): CheckFn<T, unknown> =>
        () => {
          executed.push(name);
          return { type: "pass", name };
        };

      const checks = [track("a"), track("b"), track("c")] as const;

      run_checks(checks, {});

      assert.deepEqual(executed, ["a", "b", "c"]);
    });

    it("skips checks after break_on checkpoint", () => {
      let executed: string[] = [];
      const track =
        <T extends string>(name: T): CheckFn<T, unknown> =>
        () => {
          executed.push(name);
          return { type: "pass", name };
        };

      const checks = [track("a"), track("b"), track("c")] as const;

      run_checks(checks, {}, { break_on: "b" });

      assert.deepEqual(executed, ["a", "b"]);
    });
  });
});
