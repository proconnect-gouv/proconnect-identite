import { NotFoundError } from "#src/errors";
import {
  type AddDomainHandler,
  type DeleteEmailDomainsByVerificationTypesHandler,
} from "#src/repositories/email-domain";
import type {
  FindByIdHandler,
  GetUsersByOrganizationHandler,
} from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import type { BaseUserOrganizationLink, Organization, User } from "#src/types";
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { markDomainAsVerifiedFactory } from "./mark-domain-as-verified.js";

//

describe("markDomainAsVerified", () => {
  it("should update organization members", async (t) => {
    const addDomain = mock.fn<AddDomainHandler>(() =>
      Promise.resolve({} as any),
    );
    const deleteEmailDomainsByVerificationTypes =
      mock.fn<DeleteEmailDomainsByVerificationTypesHandler>(() =>
        Promise.resolve({} as any),
      );
    const updateUserOrganizationLink =
      mock.fn<UpdateUserOrganizationLinkHandler>(() =>
        Promise.resolve({} as any),
      );

    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain,
      deleteEmailDomainsByVerificationTypes,
      findOrganizationById: mock.fn<FindByIdHandler>(() =>
        Promise.resolve({ id: 42 } as Organization),
      ),
      getUsers: mock.fn<GetUsersByOrganizationHandler>(() =>
        Promise.resolve([
          {
            id: 42,
            email: "lion.eljonson@darkangels.world",
            verification_type: null,
          } as User & BaseUserOrganizationLink,
        ]),
      ),
      updateUserOrganizationLink,
    });

    await markDomainAsVerified({
      domain: "darkangels.world",
      domain_verification_type: "verified",
      organization_id: 42,
    });

    await t.test("should call updateUserOrganizationLink with", async (t) => {
      t.assert.snapshot(updateUserOrganizationLink.mock.calls);
    });

    await t.test(
      "should call deleteEmailDomainsByVerificationTypes with",
      async (t) => {
        t.assert.snapshot(deleteEmailDomainsByVerificationTypes.mock.calls);
      },
    );

    await t.test("should call addDomain with", async (t) => {
      t.assert.snapshot(addDomain.mock.calls);
    });
  });

  it("❎ throws NotFoundError for unknown organization", async () => {
    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain: () => Promise.reject(),
      deleteEmailDomainsByVerificationTypes: () => Promise.reject(),
      findOrganizationById: () => Promise.resolve(undefined),
      getUsers: () => Promise.reject(),
      updateUserOrganizationLink: () => Promise.reject(),
    });

    await assert.rejects(
      markDomainAsVerified({
        domain: "darkangels.world",
        domain_verification_type: "verified",
        organization_id: 42,
      }),
      new NotFoundError(""),
    );
  });
});
