import assert from "node:assert/strict";
import { getDidYouMeanSuggestion } from "./did-you-mean.js";

describe("getDidYouMeanSuggestion", () => {
  const emailAddresses = [
    ["agent@gmil.com", "agent@gmail.com"],
    ["agent@wanadoo.rf", "agent@wanadoo.fr"],
    ["agent@beta.gouv.rf", "agent@beta.gouv.fr"],
    ["agent@beta.gouvfr", "agent@beta.gouv.fr"],
    ["agent@beta.gov.fr", "agent@beta.gouv.fr"],
    ["agent@betagouv.rf", "agent@betagouv.fr"],
    [
      "agent@gendarmerie.interieure.gouv.fr",
      "agent@gendarmerie.interieur.gouv.fr",
    ],
    [
      "agent@gendarmerie.interieur.gouv.frl",
      "agent@gendarmerie.interieur.gouv.fr",
    ],
    ["agent@nomatch", ""],
  ];

  emailAddresses.forEach(([inputEmail, suggestedEmail]) => {
    it(`should suggest corrected email for ${inputEmail}`, () => {
      assert.equal(getDidYouMeanSuggestion(inputEmail), suggestedEmail);
    });
  });
});
