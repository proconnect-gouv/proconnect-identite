import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { run_checks } from "./run-checks.js";
import type { CheckFn, DenyReasonCode } from "./types.js";

// Test helpers - simple pass/deny factories
const pass =
  <T extends string>(name: T): CheckFn<T, object> =>
  () => ({ type: "pass", name, ctx: {} });

const deny =
  <T extends string, TCode extends DenyReasonCode>(
    _name: T,
    code: TCode,
  ): CheckFn<T, object> =>
  () => ({ type: "deny", code });

describe("run_checks", () => {
  describe("pipeline behavior", () => {
    it("passes when all checks pass", () => {
      const checks = [pass("a"), pass("b")] as const;

      const result = run_checks(checks, {});

      assert.deepEqual(result, { type: "pass" });
    });

    it("stops on first deny and returns the reason", () => {
      const checks = [
        pass("a"),
        deny("b", "user_not_found"),
        pass("c"),
      ] as const;

      const result = run_checks(checks, {});

      assert.deepEqual(result, {
        type: "deny",
        code: "user_not_found",
      });
    });

    it("evaluates checks in order", () => {
      // If both would deny, the first one wins
      const checks = [
        deny("first", "forbidden"),
        deny("second", "not_connected"),
      ] as const;

      const result = run_checks(checks, {});

      assert.deepEqual(result, {
        type: "deny",
        code: "forbidden",
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
      const checks = [pass("a"), deny("b", "forbidden"), pass("c")] as const;

      const result = run_checks(checks, {}, { break_on: "c" });

      assert.deepEqual(result, {
        type: "deny",
        code: "forbidden",
      });
    });

    it("runs all checks when break_on is not provided", () => {
      let executed: string[] = [];
      const track =
        <T extends string>(name: T): CheckFn<T, object> =>
        () => {
          executed.push(name);
          return { type: "pass", name, ctx: {} };
        };

      const checks = [track("a"), track("b"), track("c")] as const;

      run_checks(checks, {});

      assert.deepEqual(executed, ["a", "b", "c"]);
    });

    it("skips checks after break_on checkpoint", () => {
      let executed: string[] = [];
      const track =
        <T extends string>(name: T): CheckFn<T, object> =>
        () => {
          executed.push(name);
          return { type: "pass", name, ctx: {} };
        };

      const checks = [track("a"), track("b"), track("c")] as const;

      run_checks(checks, {}, { break_on: "b" });

      assert.deepEqual(executed, ["a", "b"]);
    });
  });
});
