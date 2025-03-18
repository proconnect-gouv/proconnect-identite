//

import { NotFoundError } from "#src/errors";
import {
  LiElJonsonFranceConnectUserInfo,
  RogalDornFranceConnectUserInfo,
} from "#testing/seed/franceconnect";
import {
  LiElJonsonMandataire,
  RogalDornMandataire,
} from "@gouvfr-lasuite/proconnect.entreprise/testing/seed/infogreffe/mandataires";
import { RogalDornEntrepreneur } from "@gouvfr-lasuite/proconnect.entreprise/testing/seed/insee/siret";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOrganizationExecutiveFactory } from "./is-organization-executive.js";

//

describe("isOrganizationExecutiveFactory", () => {
  it("should recognize a user as executive of a auto-entrepreneur found on infogreffe", async () => {
    const isOrganizationExecutive = isOrganizationExecutiveFactory({
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
      findMandatairesSociauxBySiren: () =>
        Promise.resolve([RogalDornMandataire]),
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isExecutive = await isOrganizationExecutive("94957325700019", 1);
    assert.equal(isExecutive, true);
  });

  it("should not match another mandataire", async () => {
    const isOrganizationExecutive = isOrganizationExecutiveFactory({
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
      findMandatairesSociauxBySiren: () =>
        Promise.resolve([LiElJonsonMandataire]),
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isExecutive = await isOrganizationExecutive("94957325700019", 1);
    assert.equal(isExecutive, false);
  });

  it("❎ fail with no franceconnect user info", async () => {
    const isOrganizationExecutive = isOrganizationExecutiveFactory({
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
      findMandatairesSociauxBySiren: () => Promise.resolve([]),
      getFranceConnectUserInfo: () => Promise.resolve(undefined),
    });

    await assert.rejects(
      isOrganizationExecutive("94957325700019", 1),
      new NotFoundError("FranceConnect UserInfo not found"),
    );
  });

  it("❎ fail with no mandataires", async () => {
    const isOrganizationExecutive = isOrganizationExecutiveFactory({
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
      findMandatairesSociauxBySiren: () => Promise.resolve([]),
      getFranceConnectUserInfo: () =>
        Promise.resolve(LiElJonsonFranceConnectUserInfo),
    });

    await assert.rejects(
      isOrganizationExecutive("94957325700019", 1),
      new NotFoundError("No mandataires found"),
    );
  });
});
