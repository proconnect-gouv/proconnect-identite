import { NotFoundError } from "#src/errors";
import type { Organization, User } from "#src/types";
import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { forceJoinOrganizationFactory } from "./force-join-organization.js";

suite("forceJoinOrganizationFactory", () => {
  test("should update the organization user link ", async () => {
    const forceJoinOrganization = forceJoinOrganizationFactory({
      findById: () => Promise.resolve({ id: 42 } as Organization),
      findEmailDomainsByOrganizationId: () => Promise.resolve([]),
      findUserById: () =>
        Promise.resolve({ email: "lion.eljonson@darkangels.world" } as User),
      linkUserToOrganization: (values) => Promise.resolve(values as any),
    });

    assert.deepEqual(
      await forceJoinOrganization({
        organization_id: 42,
        user_id: 42,
      }),
      {
        is_external: false,
        organization_id: 42,
        user_id: 42,
        verification_type: "no_validation_means_available",
      },
    );
  });

  test("❎ throws NotFoundError for unknown organization", async () => {
    const forceJoinOrganization = forceJoinOrganizationFactory({
      findById: () => Promise.resolve(undefined),
      findEmailDomainsByOrganizationId: () => Promise.resolve([]),
      findUserById: () => Promise.resolve({ id: 42 } as User),
      linkUserToOrganization: () => Promise.reject(),
    });

    assert.rejects(
      forceJoinOrganization({
        organization_id: 42,
        user_id: 42,
      }),
      NotFoundError,
    );
  });

  test("❎ throws NotFoundError for unknown user", async () => {
    const forceJoinOrganization = forceJoinOrganizationFactory({
      findById: () => Promise.resolve({ id: 42 } as Organization),
      findEmailDomainsByOrganizationId: () => Promise.resolve([]),
      findUserById: () => Promise.resolve(undefined),
      linkUserToOrganization: () => Promise.reject(),
    });

    assert.rejects(
      forceJoinOrganization({
        organization_id: 42,
        user_id: 42,
      }),
      NotFoundError,
    );
  });
});
