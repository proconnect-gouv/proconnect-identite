import { NotFoundError } from "#src/errors";
import {
  type AddDomainHandler,
  type FindEmailDomainsByOrganizationIdHandler,
} from "#src/repositories/email-domain";
import type {
  FindByIdHandler,
  GetUsersByOrganizationHandler,
} from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import type { BaseUserOrganizationLink, Organization, User } from "#src/types";
import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";
import { markDomainAsVerifiedFactory } from "./mark-domain-as-verified.js";

//

suite("markDomainAsVerifiedFactory", () => {
  test("should update organization members", async () => {
    const addDomain = mock.fn<AddDomainHandler>(() =>
      Promise.resolve({} as any),
    );
    const updateUserOrganizationLink =
      mock.fn<UpdateUserOrganizationLinkHandler>(() =>
        Promise.resolve({} as any),
      );

    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain,
      findEmailDomainsByOrganizationId:
        mock.fn<FindEmailDomainsByOrganizationIdHandler>(),
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

    assert.equal(updateUserOrganizationLink.mock.callCount(), 1);
    {
      const [call] = updateUserOrganizationLink.mock.calls;
      assert.deepEqual(call.arguments, [
        42,
        42,
        { verification_type: "domain" },
      ]);
    }

    assert.equal(addDomain.mock.callCount(), 1);
    {
      const [call] = addDomain.mock.calls;
      assert.deepEqual(call.arguments, [
        {
          domain: "darkangels.world",
          organization_id: 42,
          verification_type: "verified",
        },
      ]);
    }
  });

  test("❎ throws NotFoundError for unknown organization", async () => {
    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain: () => Promise.reject(),
      findEmailDomainsByOrganizationId: () => Promise.reject(),
      findOrganizationById: () => Promise.resolve(undefined),
      getUsers: () => Promise.reject(),
      updateUserOrganizationLink: () => Promise.reject(),
    });

    assert.rejects(
      markDomainAsVerified({
        domain: "darkangels.world",
        domain_verification_type: "verified",
        organization_id: 42,
      }),
      NotFoundError,
    );
  });
});
