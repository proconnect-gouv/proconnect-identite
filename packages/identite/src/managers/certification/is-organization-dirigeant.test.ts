//

import { NotFoundError } from "#src/errors";
import {
  LiElJonsonFranceConnectUserInfo,
  RogalDornFranceConnectUserInfo,
} from "#testing/seed/franceconnect";
import {
  LiElJonsonEstablishment,
  RogalDornEstablishment,
} from "#testing/seed/insee";
import { UlysseToriMandataire } from "#testing/seed/mandataires";
import {
  Papillon,
  RogalDornEntrepreneur as RogalDornSireneEntrepreneur,
} from "@gouvfr-lasuite/proconnect.entreprise/testing/seed/insee/siret";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOrganizationDirigeantFactory } from "./is-organization-dirigeant.js";

//

describe("isOrganizationDirigeantFactory", () => {
  it("should recognize a user as executive of a auto-entrepreneur found on infogreffe", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      EntrepriseApiInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      EntrepriseApiInseeRepository: {
        findBySiret: () => Promise.resolve(RogalDornSireneEntrepreneur),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.resolve(RogalDornEstablishment),
      },
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isDirigeant = await isOrganizationDirigeant(
      RogalDornSireneEntrepreneur.siret,
      1,
    );
    assert.equal(isDirigeant, true);
  });

  it("should not match another mandataire", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      EntrepriseApiInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      EntrepriseApiInseeRepository: {
        findBySiret: () => Promise.resolve(RogalDornSireneEntrepreneur),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.resolve(LiElJonsonEstablishment),
      },
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isDirigeant = await isOrganizationDirigeant(
      RogalDornSireneEntrepreneur.siret,
      1,
    );
    assert.equal(isDirigeant, false);
  });

  it("should match Ulysse Tori as an executive of Papillon", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      EntrepriseApiInfogreffeRepository: {
        findMandatairesSociauxBySiren: () =>
          Promise.resolve([UlysseToriMandataire]),
      },
      EntrepriseApiInseeRepository: {
        findBySiret: () => Promise.resolve(Papillon),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.reject(new Error("💣")),
      },
      getFranceConnectUserInfo: () =>
        Promise.resolve(RogalDornFranceConnectUserInfo),
    });
    const isDirigeant = await isOrganizationDirigeant(Papillon.siret, 1);
    assert.equal(isDirigeant, false);
  });

  it("❎ fail with no franceconnect user info", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      EntrepriseApiInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.reject(new Error("💣")),
      },
      EntrepriseApiInseeRepository: {
        findBySiret: () => Promise.resolve(RogalDornSireneEntrepreneur),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.reject(new Error("💣")),
      },
      getFranceConnectUserInfo: () => Promise.resolve(undefined),
    });

    await assert.rejects(
      isOrganizationDirigeant("94957325700019", 1),
      new NotFoundError("FranceConnect UserInfo not found"),
    );
  });

  it("❎ fail with no mandataires", async () => {
    const isOrganizationDirigeant = isOrganizationDirigeantFactory({
      EntrepriseApiInfogreffeRepository: {
        findMandatairesSociauxBySiren: () => Promise.resolve([]),
      },
      EntrepriseApiInseeRepository: {
        findBySiret: () => Promise.resolve(Papillon),
      },
      InseeApiRepository: {
        findBySiret: () => Promise.reject(new Error("💣")),
      },
      getFranceConnectUserInfo: () =>
        Promise.resolve(LiElJonsonFranceConnectUserInfo),
    });

    await assert.rejects(
      isOrganizationDirigeant(Papillon.siret, 1),
      new NotFoundError("No mandataires found"),
    );
  });
});
