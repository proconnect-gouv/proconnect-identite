import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createCheckChain } from "./chain-builder.js";
import { deny, pass } from "./check-helpers.js";

// Mock checks for testing type deduction
const check_with_optional_user = (_ctx: { user?: string }) => {
  return pass("opt_user_pass");
};

const check_establishing_user = (ctx: { user?: string }) => {
  return ctx.user
    ? pass("user_found", { user: ctx.user })
    : deny("user_not_found");
};

const check_requiring_user = (_ctx: { user: string }) => {
  return pass("req_user_pass");
};

describe("CheckChainBuilder (Infrastructure)", () => {
  it("allows building a valid chain", () => {
    const pipeline = createCheckChain<{ user?: string }>()
      .add(check_with_optional_user)
      .add(check_establishing_user)
      .add(check_requiring_user)
      .build();

    assert.equal(pipeline.checks.length, 3);
  });

  describe("PipelineContext reduction & ordering", () => {
    it("fails at compile time if requirements are not met", () => {
      const p = createCheckChain<{ user?: string }>().add(check_requiring_user);

      // @ts-expect-error - p is now a TypeError, so it's not a CheckChainBuilder
      const _p: any = p;
    });

    it("passes at compile time if requirements are met by establishment", () => {
      // This should NOT have a type error
      createCheckChain<{ user?: string }>()
        .add(check_establishing_user)
        .add(check_requiring_user);
    });
  });

  describe("Runtime execution", () => {
    it("passes when all checks pass", () => {
      const pipeline = createCheckChain<{ user?: string }>()
        .add(check_establishing_user)
        .build();

      const result = pipeline.run({ user: "exists" });
      assert.deepEqual(result, { type: "pass" });
    });

    it("denies when a check fails", () => {
      const pipeline = createCheckChain<{ user?: string }>()
        .add(check_establishing_user)
        .build();

      const result = pipeline.run({ user: undefined });
      assert.deepEqual(result, { type: "deny", code: "user_not_found" });
    });

    it("stops at break_on checkpoint", () => {
      let secondExecuted = false;
      const check2 = () => {
        secondExecuted = true;
        return pass("two");
      };

      const pipeline = createCheckChain<{}>()
        .add(() => pass("one"))
        .add(check2)
        .build();

      const result = pipeline.run({}, { break_on: "one" });
      assert.deepEqual(result, { type: "pass" });
      assert.equal(secondExecuted, false);
    });
  });
});
