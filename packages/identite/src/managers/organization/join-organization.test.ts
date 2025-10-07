import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EmailDomain } from "../../types/index.js";
import { JoinOrganizationFactory } from "./join-organization.js";

describe("JoinOrganizationFactory", () => {
  it("should join update the organization  ", async () => {
    const getOrganizationInfo: any = () => Promise.resolve();
    const findByUserId: any = () => Promise.resolve();
    const createModeration: any = () => Promise.resolve();
    const findPendingModeration: any = () => Promise.resolve();
    const findRejectedModeration: any = () => Promise.resolve();
    const getAnnuaireEducationNationaleContactEmail: any = () =>
      Promise.resolve();
    const getAnnuaireServicePublicContactEmail: any = () => Promise.resolve();
    const isOrganizationDirigeant: any = () => Promise.resolve();
    const linkUserToOrganization: any = (values: any) =>
      Promise.resolve(values as any);
    const markDomainAsVerified: any = () => Promise.resolve();
    const startCripsConversation: any = () => Promise.resolve();
    const isAFreeDomain: any = () => Promise.resolve();
    const findEmailDomainsByOrganizationId: any = () =>
      Promise.resolve([
        {
          domain: "darkangels.world",
          verification_type: "verified",
        } as EmailDomain,
      ]);
    const unableToAutoJoinOrganizationMd: any = () => Promise.resolve();
    const getUserById: any = () =>
      Promise.resolve({
        email: "lion.eljonson@darkangels.world",
        family_name: "Eljonson",
        given_name: "Lion",
      });
    const upsert: any = () =>
      Promise.resolve({ id: 42, cached_est_active: true });
    const join_organization = JoinOrganizationFactory({
      createModeration,
      findByUserId,
      findEmailDomainsByOrganizationId,
      findPendingModeration,
      findRejectedModeration,
      getAnnuaireEducationNationaleContactEmail,
      getAnnuaireServicePublicContactEmail,
      getOrganizationInfo,
      getUserById,
      isAFreeDomain,
      isOrganizationDirigeant,
      linkUserToOrganization,
      markDomainAsVerified,
      startCripsConversation,
      unableToAutoJoinOrganizationMd,
      upsert,
    });

    assert.deepEqual(
      await join_organization({
        confirmed: true,
        siret: "🦄 siret",
        user_id: 42,
      }),
      {
        organization_id: 42,
        user_id: 42,
        verification_type: "domain",
      },
    );
  });
});
