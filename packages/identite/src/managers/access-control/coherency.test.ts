import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { User } from "../../types/index.js";
import { define_check_chain, type PipelineContext } from "./coherency.js";
import type { CheckFn } from "./types.js";

// Mock checks for testing type deduction
const check_with_optional_user: CheckFn<"opt_user_pass", { user?: User }> = (
  _ctx,
) => {
  return { type: "pass", name: "opt_user_pass" };
};

const check_establishing_user: CheckFn<"user_found", { user?: User }> = (
  ctx,
) => {
  return ctx.user
    ? { type: "pass", name: "user_found" }
    : { type: "deny", name: "any", reason: { code: "user_not_found" } };
};

const check_requiring_user: CheckFn<"req_user_pass", { user: User }> = (
  _ctx,
) => {
  return { type: "pass", name: "req_user_pass" };
};

describe("Coherent Chaining (Infrastructure)", () => {
  it("allows passing the chain through define_check_chain", () => {
    const chain = define_check_chain([check_with_optional_user] as const);
    assert.equal(chain.length, 1);
  });

  describe("PipelineContext reduction", () => {
    it("deduces {user?: User} for a single optional check", () => {
      type Actual = PipelineContext<readonly [typeof check_with_optional_user]>;
      const test: Actual = { user: undefined };
      assert.ok("user" in test);
    });

    it("satisfies required user if preceded by user_found establishment", () => {
      // Logic: If we have [check_establishing_user, check_requiring_user]
      // check_establishing_user establishes {user: User} on "user_found" pass.
      // So check_requiring_user's {user: User} requirement should be satisfied.

      const chain = [check_establishing_user, check_requiring_user] as const;
      type Actual = PipelineContext<typeof chain>;

      // The cumulative requirement for the LOADER should only be {user?: User}
      const test: Actual = { user: undefined };
      assert.ok("user" in test);
    });
  });
});
