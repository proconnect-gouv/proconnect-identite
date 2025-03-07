import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { usesAFreeEmailProvider } from "../src/services/email";

describe("usesAFreeEmailProvider", () => {
  const emailAddressesThatUsesFreeEmailProviders = [
    "user@gmail.com",
    "collectivite@wanadoo.fr",
    "collectivite@orange.fr",
    "serious@9business.fr",
  ];

  emailAddressesThatUsesFreeEmailProviders.forEach((email) => {
    it("should return true for free email provider address", () => {
      assert.equal(usesAFreeEmailProvider(email), true);
    });
  });

  const professionalEmailAddresses = [
    "user@beta.gouv.fr",
    "collectivite@paris.fr",
    "nom.prenom@notaires.fr",
  ];

  professionalEmailAddresses.forEach((professionalEmailAddress) => {
    it("should return false for non free provider email address", () => {
      assert.equal(usesAFreeEmailProvider(professionalEmailAddress), false);
    });
  });
});
