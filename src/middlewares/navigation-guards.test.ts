//

import type { User } from "@proconnect-gouv/proconnect.identite/types";
import type { Request } from "express";
import HttpErrors from "http-errors";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  requireIsUser,
  type GuardContext,
  type GuardResult,
  type NavigationGuardNode,
} from "./navigation-guards";

//

const test_navigation_guard_chain = async (
  node: NavigationGuardNode,
  context?: Partial<GuardContext>,
): Promise<GuardResult[]> => {
  const result = await node.guard({
    uses_auth_headers: false,
    user: {} as User,
    organizations: [],
    is_within_authenticated_session: false,
    req: {} as Request,
    ...context,
  });
  if (!node.previous) return [result];

  return [...(await test_navigation_guard_chain(node.previous)), result];
};

//

describe("navigation-guards", () => {
  describe("requireIsUser", () => {
    it("rejects with forbidden", async () => {
      try {
        await test_navigation_guard_chain(requireIsUser, {
          uses_auth_headers: true,
        });
        assert.fail("💥 Should have thrown");
      } catch (err) {
        assert.deepEqual(
          err,
          new HttpErrors.Forbidden(
            "Access denied. The requested resource does not require authentication.",
          ),
        );
      }
    });

    it("should pass", async () => {
      assert.deepEqual(await test_navigation_guard_chain(requireIsUser), [
        { type: "next" },
      ]);
    });
  });
});
