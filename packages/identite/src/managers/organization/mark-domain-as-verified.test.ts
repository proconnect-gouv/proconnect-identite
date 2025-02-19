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
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { mock } from "node:test";
import { markDomainAsVerifiedFactory } from "./mark-domain-as-verified.js";

//

chai.use(chaiAsPromised);
const expect = chai.expect;

describe(markDomainAsVerifiedFactory.name, () => {
  it("should update organization members", async () => {
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

    expect(updateUserOrganizationLink.mock.callCount()).to.equal(1);
    {
      const [call] = updateUserOrganizationLink.mock.calls;
      expect(call.arguments).to.deep.equal([
        42,
        42,
        { verification_type: "domain" },
      ]);
    }

    expect(addDomain.mock.callCount()).to.equal(1);
    {
      const [call] = addDomain.mock.calls;
      expect(call.arguments).to.deep.equal([
        {
          domain: "darkangels.world",
          organization_id: 42,
          verification_type: "verified",
        },
      ]);
    }
  });

  it("❎ throws NotFoundError for unknown organization", async () => {
    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain: () => Promise.reject(),
      findEmailDomainsByOrganizationId: () => Promise.reject(),
      findOrganizationById: () => Promise.resolve(undefined),
      getUsers: () => Promise.reject(),
      updateUserOrganizationLink: () => Promise.reject(),
    });

    await expect(
      markDomainAsVerified({
        domain: "darkangels.world",
        domain_verification_type: "verified",
        organization_id: 42,
      }),
    ).rejectedWith(NotFoundError);
  });
});
