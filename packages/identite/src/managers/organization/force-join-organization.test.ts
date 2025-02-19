import { NotFoundError } from "#src/errors";
import type { Organization, User } from "#src/types";
import * as chai from "chai";
import "chai-as-promised";
import chaiAsPromised from "chai-as-promised";
import { describe } from "mocha";
import { forceJoinOrganizationFactory } from "./force-join-organization.js";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe(forceJoinOrganizationFactory.name, () => {
  it("should update the organization user link ", async () => {
    const forceJoinOrganization = forceJoinOrganizationFactory({
      findById: () => Promise.resolve({ id: 42 } as Organization),
      findEmailDomainsByOrganizationId: () => Promise.resolve([]),
      findUserById: () =>
        Promise.resolve({ email: "lion.eljonson@darkangels.world" } as User),
      linkUserToOrganization: (values) => Promise.resolve(values as any),
    });

    await expect(
      forceJoinOrganization({
        organization_id: 42,
        user_id: 42,
      }),
    ).eventually.deep.equal({
      is_external: false,
      organization_id: 42,
      user_id: 42,
      verification_type: "no_validation_means_available",
    });
  });

  it("❎ throws NotFoundError for unknown organization", async () => {
    const forceJoinOrganization = forceJoinOrganizationFactory({
      findById: () => Promise.resolve(undefined),
      findEmailDomainsByOrganizationId: () => Promise.resolve([]),
      findUserById: () => Promise.resolve({ id: 42 } as User),
      linkUserToOrganization: () => Promise.reject(),
    });

    await expect(
      forceJoinOrganization({
        organization_id: 42,
        user_id: 42,
      }),
    ).rejectedWith(NotFoundError);
  });

  it("❎ throws NotFoundError for unknown user", async () => {
    const forceJoinOrganization = forceJoinOrganizationFactory({
      findById: () => Promise.resolve({ id: 42 } as Organization),
      findEmailDomainsByOrganizationId: () => Promise.resolve([]),
      findUserById: () => Promise.resolve(undefined),
      linkUserToOrganization: () => Promise.reject(),
    });

    await expect(
      forceJoinOrganization({
        organization_id: 42,
        user_id: 42,
      }),
    ).rejectedWith(NotFoundError);
  });
});
