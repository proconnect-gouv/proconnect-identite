//

import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { assignUserVerificationTypeToDomainFactory } from "./assign-user-verification-type-to-domain.js";

//

describe("assignUserVerificationTypeToDomain", () => {
  it("should update some organization members", async () => {
    const updateUserOrganizationLink = mock.fn(() =>
      Promise.resolve({} as any),
    );
    const assignUserVerificationTypeToDomain =
      assignUserVerificationTypeToDomainFactory({
        getUsers: () =>
          Promise.resolve([
            { email: "foo@bar.world" },
            { email: "foo@darkangels.world" },
            {
              email: "foo@darkangels.world",
              verification_type: "verified",
            },
            {
              id: 42,
              email: "lion.eljonson@darkangels.world",
              verification_type: "no_validation_means_available",
            },
            {
              id: 43,
              email: "cat.eljonson@darkangels.world",
              verification_type:
                "no_verification_means_for_entreprise_unipersonnelle",
            },
            {
              id: 44,
              email: "tiger.eljonson@darkangels.world",
              verification_type: "no_verification_means_for_small_association",
            },
            {
              id: 45,
              email: "mouse.eljonson@darkangels.world",
              verification_type: "domain_not_verified_yet",
            },
          ] as any),
        updateUserOrganizationLink,
      });

    await assignUserVerificationTypeToDomain(111, "darkangels.world");

    const [lion, cat, tiger, mouse] = updateUserOrganizationLink.mock.calls;
    assert.deepEqual(lion.arguments, [
      111,
      42,
      {
        verification_type: "domain",
      },
    ]);
    assert.deepEqual(cat.arguments, [
      111,
      43,
      {
        verification_type: "domain",
      },
    ]);
    assert.deepEqual(tiger.arguments, [
      111,
      44,
      {
        verification_type: "domain",
      },
    ]);
    assert.deepEqual(mouse.arguments, [
      111,
      45,
      {
        verification_type: "domain",
      },
    ]);
    assert.equal(updateUserOrganizationLink.mock.callCount(), 4);
  });

  it("❎ should update nothing if no organization members", async () => {
    const updateUserOrganizationLink = mock.fn(() =>
      Promise.reject(new Error("💣")),
    );
    const assignUserVerificationTypeToDomain =
      assignUserVerificationTypeToDomainFactory({
        getUsers: () => Promise.resolve([]),
        updateUserOrganizationLink,
      });

    await assignUserVerificationTypeToDomain(42, "darkangels.world");

    assert.deepEqual(updateUserOrganizationLink.mock.calls, []);
  });
});
