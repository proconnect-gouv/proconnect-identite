import assert from "node:assert";
import { describe, it } from "node:test";
import { allowsPersonalInfoEditing } from "./moderation";

describe("allowsPersonalInfoEditing", () => {
  it("should return true for all warning reasons", () => {
    const warningReasons = [
      "Inversion Nom et Prénom",
      "Nom et/ou Prénom manquants",
      "Nom et/ou prénom mal renseignés - Modération non-bloquante",
    ];

    warningReasons.forEach((reason) => {
      const result = allowsPersonalInfoEditing(reason);
      assert.strictEqual(result, true, `Expected true for: ${reason}`);
    });
  });

  it("should return false for non-warning reasons", () => {
    const blockingReasons = [
      "Nom de domaine introuvable",
      "Documents manquants",
      "Organisation non éligible",
      "",
      "Inversion Nom",
      "Profession mal renseignée - Modération non-bloquante",
      "Profession mal renseignée",
    ];

    blockingReasons.forEach((reason) => {
      const result = allowsPersonalInfoEditing(reason);
      assert.strictEqual(result, false, `Expected false for: ${reason}`);
    });
  });
});
