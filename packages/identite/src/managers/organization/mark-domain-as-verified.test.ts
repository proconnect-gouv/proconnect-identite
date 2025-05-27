import { NotFoundError } from "#src/errors";
import {
  type AddDomainHandler,
  type FindEmailDomainsByOrganizationIdHandler,
  type UpdateDomainVerificationTypeHandler,
} from "#src/repositories/email-domain";
import type {
  FindByIdHandler,
  GetUsersByOrganizationHandler,
} from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import type {
  BaseUserOrganizationLink,
  EmailDomain,
  Organization,
  User,
} from "#src/types";
import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";
import { markDomainAsVerifiedFactory } from "./mark-domain-as-verified.js";

//

suite("markDomainAsVerifiedFactory", () => {
  test("should update organization members", async (t) => {
    const addDomain = mock.fn<AddDomainHandler>(() =>
      Promise.resolve({} as any),
    );
    const updateDomainVerificationType =
      mock.fn<UpdateDomainVerificationTypeHandler>(() =>
        Promise.resolve({} as any),
      );
    const updateUserOrganizationLink =
      mock.fn<UpdateUserOrganizationLinkHandler>(() =>
        Promise.resolve({} as any),
      );

    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain,
      updateDomainVerificationType,
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

    await t.test("should call updateUserOrganizationLink with", async (t) => {
      t.assert.snapshot(updateUserOrganizationLink.mock.calls);
    });

    await t.test("should call updateDomainVerificationType with", async (t) => {
      t.assert.snapshot(updateDomainVerificationType.mock.calls);
    });

    await t.test("should call not addDomain", async (t) => {
      t.assert.equal(addDomain.mock.callCount, 0);
    });
  });

  test("should add domain if no domain for organization", async (t) => {
    const addDomain = mock.fn<AddDomainHandler>(() =>
      Promise.resolve({} as any),
    );
    const updateDomainVerificationType =
      mock.fn<UpdateDomainVerificationTypeHandler>(() =>
        Promise.resolve({} as any),
      );

    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain,
      updateDomainVerificationType,
      findEmailDomainsByOrganizationId:
        mock.fn<FindEmailDomainsByOrganizationIdHandler>(() =>
          Promise.resolve([] as EmailDomain[]),
        ),
      findOrganizationById: mock.fn<FindByIdHandler>(() =>
        Promise.resolve({ id: 42 } as Organization),
      ),
      getUsers: mock.fn<GetUsersByOrganizationHandler>(() =>
        Promise.resolve([]),
      ),
      updateUserOrganizationLink: mock.fn<UpdateUserOrganizationLinkHandler>(),
    });

    await markDomainAsVerified({
      domain: "darkangels.world",
      domain_verification_type: "verified",
      organization_id: 42,
    });

    await t.test("should call addDomain with", async (t) => {
      t.assert.snapshot(addDomain.mock.calls);
    });

    await t.test("should not call updateDomainVerificationType", async (t) => {
      t.assert.equal(updateDomainVerificationType.mock.callCount, 0);
    });
  });

  test("❎ throws NotFoundError for unknown organization", async () => {
    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain: () => Promise.reject(),
      updateDomainVerificationType: () => Promise.reject(),
      findEmailDomainsByOrganizationId: () => Promise.reject(),
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
