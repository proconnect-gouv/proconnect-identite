import { run_checks, type CheckGenerator } from "#src/managers/access-control";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("run_checks", () => {
  it("should return pass when generator completes", () => {
    function* gen(): CheckGenerator<"check_a"> {
      yield "check_a";
      return { type: "pass" };
    }

    const result = run_checks(gen());

    assert.deepEqual(result, { type: "pass" });
  });

  it("should return deny reason when generator returns early", () => {
    function* gen(): CheckGenerator<"check_a"> {
      return { type: "deny", reason: { code: "forbidden" } };
    }

    const result = run_checks(gen());

    assert.deepEqual(result, {
      type: "deny",
      reason: { code: "forbidden" },
    });
  });

  it("should stop at specified check and return pass", () => {
    function* gen(): CheckGenerator<"check_a" | "check_b"> {
      yield "check_a";
      yield "check_b";
      return { type: "pass" };
    }

    const result = run_checks(gen(), "check_a");

    assert.deepEqual(result, { type: "pass" });
  });

  it("should continue past unmatched stop_after and check next condition", () => {
    function* gen(): CheckGenerator<"check_a" | "check_b"> {
      yield "check_a";
      return { type: "deny", reason: { code: "not_connected" } };
    }

    const result = run_checks(gen(), "check_b");

    assert.deepEqual(result, {
      type: "deny",
      reason: { code: "not_connected" },
    });
  });

  it("should handle multiple yields before stop_after", () => {
    function* gen(): CheckGenerator<"check_a" | "check_b" | "check_c"> {
      yield "check_a";
      yield "check_b";
      yield "check_c";
      return { type: "pass" };
    }

    const result = run_checks(gen(), "check_b");

    assert.deepEqual(result, { type: "pass" });
  });

  it("should return early deny if condition fails before stop_after", () => {
    function* gen(): CheckGenerator<"check_a" | "check_b" | "check_c"> {
      yield "check_a";
      return {
        type: "deny",
        reason: { code: "email_not_verified" },
      };
    }

    const result = run_checks(gen(), "check_c");

    assert.deepEqual(result, {
      type: "deny",
      reason: { code: "email_not_verified" },
    });
  });
});
