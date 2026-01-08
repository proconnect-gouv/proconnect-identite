//

import type { User } from "@proconnect-gouv/proconnect.identite/types";
import type { Request } from "express";
import HttpErrors from "http-errors";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  requireEmailInSession,
  requireIsUser,
  requireUserHasSeenInclusionconnectWelcomePage,
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
    email: "test@test.com",
    is_within_authenticated_session: false,
    needsInclusionconnectWelcomePage: false,
    organizations: [],
    req: {} as Request,
    user: {} as User,
    uses_auth_headers: false,
    ...context,
  });
  if (!node.previous) return [result];

  return [
    ...(await test_navigation_guard_chain(node.previous, context)),
    result,
  ];
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

  describe("requireEmailInSession", () => {
    it("redirects to start-sign-in when no email", async () => {
      assert.deepEqual(
        await test_navigation_guard_chain(requireEmailInSession, {
          email: undefined,
        }),
        [{ type: "next" }, { type: "redirect", url: "/users/start-sign-in" }],
      );
    });

    it("should pass", async () => {
      assert.deepEqual(
        await test_navigation_guard_chain(requireEmailInSession),
        [{ type: "next" }, { type: "next" }],
      );
    });
  });

  describe("requireUserHasSeenInclusionconnectWelcomePage", () => {
    it("redirects to inclusionconnect-welcome when needed", async () => {
      assert.deepEqual(
        await test_navigation_guard_chain(
          requireUserHasSeenInclusionconnectWelcomePage,
          { needsInclusionconnectWelcomePage: true },
        ),
        [
          { type: "next" },
          { type: "next" },
          { type: "redirect", url: "/users/inclusionconnect-welcome" },
        ],
      );
    });

    it("should pass", async () => {
      assert.deepEqual(
        await test_navigation_guard_chain(
          requireUserHasSeenInclusionconnectWelcomePage,
        ),
        [{ type: "next" }, { type: "next" }, { type: "next" }],
      );
    });
  });
});
