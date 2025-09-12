import assert from "node:assert";
import { describe, it } from "node:test";
import { extractRejectionReason, isWarningRejection } from "./moderation";

describe("extractRejectionReason", () => {
  it("should extract reason from standard format", () => {
    const comment =
      'Rejeté par moderator@yopmail.com | Raison : "Nom de domaine introuvable"';
    const result = extractRejectionReason(comment);
    assert.strictEqual(result, "Nom de domaine introuvable");
  });

  it("should extract reason with different spacing", () => {
    const comment =
      'Rejeté par user@example.com | Raison: "Documents manquants"';
    const result = extractRejectionReason(comment);
    assert.strictEqual(result, "Documents manquants");
  });

  it("should extract reason with extra spaces", () => {
    const comment =
      'Rejeté par admin@test.com |   Raison  :   "Organisation non éligible"';
    const result = extractRejectionReason(comment);
    assert.strictEqual(result, "Organisation non éligible");
  });

  it("should handle case insensitive matching", () => {
    const comment = 'Rejeté par user@example.com | raison : "Profil incomplet"';
    const result = extractRejectionReason(comment);
    assert.strictEqual(result, "Profil incomplet");
  });

  it("should fallback to original comment when no quoted reason pattern", () => {
    const comment = "Rejeté par moderator@yopmail.com | Documents insuffisants";
    const result = extractRejectionReason(comment);
    assert.strictEqual(
      result,
      "Rejeté par moderator@yopmail.com | Documents insuffisants",
    );
  });

  it("should return original comment when no standard format", () => {
    const comment = "Demande rejetée pour cause de données manquantes";
    const result = extractRejectionReason(comment);
    assert.strictEqual(
      result,
      "Demande rejetée pour cause de données manquantes",
    );
  });

  it("should handle null comment", () => {
    const result = extractRejectionReason(null);
    assert.strictEqual(result, "Raison non spécifiée");
  });

  it("should handle empty comment", () => {
    const result = extractRejectionReason("");
    assert.strictEqual(result, "Raison non spécifiée");
  });

  it("should handle complex reason with punctuation", () => {
    const comment =
      "Rejeté par admin@gouv.fr | Raison : \"L'adresse e-mail ne correspond pas au domaine de l'organisation (attendu: @mairie.fr)\"";
    const result = extractRejectionReason(comment);
    assert.strictEqual(
      result,
      "L'adresse e-mail ne correspond pas au domaine de l'organisation (attendu: @mairie.fr)",
    );
  });

  it("should handle reason with nested quotes", () => {
    const comment =
      'Rejeté par moderator@test.com | Raison : "Document \\"justificatif\\" manquant"';
    const result = extractRejectionReason(comment);
    assert.strictEqual(result, 'Document "justificatif" manquant');
  });
});

describe("isWarningRejection", () => {
  it("should return true for all warning reasons", () => {
    const warningReasons = [
      "Inversion Nom et Prénom",
      "Nom et/ou Prénom manquants",
      "Nom et/ou prénom mal renseignés - Modération non-bloquante",
      "Profession mal renseignée - Modération non-bloquante",
      "Profession mal renseignée",
    ];

    warningReasons.forEach((reason) => {
      const result = isWarningRejection(reason);
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
    ];

    blockingReasons.forEach((reason) => {
      const result = isWarningRejection(reason);
      assert.strictEqual(result, false, `Expected false for: ${reason}`);
    });
  });
});
