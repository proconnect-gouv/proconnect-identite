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
import { isOrganizationDirigeantFactory } from "./is-organization-dirigeant.js";

//

describe("isOrganizationDirigeantFactory", () => {
  it("should recognize a user as executive of a auto-entrepreneur found on infogreffe", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
      findMandatairesSociauxBySiren: () =>
        Promise.resolve([RogalDornMandataire]),
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isDirigeant = await isOrganizationDirigeant("94957325700019", 1);
    assert.equal(isDirigeant, true);
  });

  it("should not match another mandataire", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
      findMandatairesSociauxBySiren: () =>
        Promise.resolve([LiElJonsonMandataire]),
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isDirigeant = await isOrganizationDirigeant("94957325700019", 1);
    assert.equal(isDirigeant, false);
  });

  it("❎ fail with no franceconnect user info", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
      findMandatairesSociauxBySiren: () => Promise.resolve([]),
      getFranceConnectUserInfo: () => Promise.resolve(undefined),
    });

    await assert.rejects(
      isOrganizationDirigeant("94957325700019", 1),
      new NotFoundError("FranceConnect UserInfo not found"),
    );
  });

  it("❎ fail with no mandataires", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      findBySiret: () => Promise.resolve(RogalDornEntrepreneur),
      findMandatairesSociauxBySiren: () => Promise.resolve([]),
      getFranceConnectUserInfo: () =>
        Promise.resolve(LiElJonsonFranceConnectUserInfo),
    });

    await assert.rejects(
      isOrganizationDirigeant("94957325700019", 1),
      new NotFoundError("No mandataires found"),
    );
  });
});
