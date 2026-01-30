import type { Organization } from "#src/types";
import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { joinOrganization } from "./join-organization.js";

suite("joinOrganization", () => {
  test("returns error when organization is not active", () => {
    const result = joinOrganization({
      cached_est_active: false,
    } as Organization);

    assert.deepEqual(result, {
      type: "error",
      reason: "organization_not_active",
    });
  });

  test("returns link for entreprise unipersonnelle", () => {
    const result = joinOrganization({
      cached_est_active: true,
      cached_libelle_categorie_juridique: "Entrepreneur individuel",
      cached_tranche_effectifs_unite_legale: "00",
    } as Organization);

    assert.deepEqual(result, {
      type: "link",
      verification_type: "no_verification_means_for_entreprise_unipersonnelle",
    });
  });

  test("returns link for small association", () => {
    const result = joinOrganization({
      cached_est_active: true,
      cached_libelle_categorie_juridique: "Association déclarée",
      cached_tranche_effectifs: "12",
    } as Organization);

    assert.deepEqual(result, {
      type: "link",
      verification_type: "no_verification_means_for_small_association",
    });
  });

  test("returns link with no_validation_means_available by default", () => {
    const result = joinOrganization({
      cached_est_active: true,
      cached_libelle_categorie_juridique: "Service central d'un ministère",
    } as Organization);

    assert.deepEqual(result, {
      type: "link",
      verification_type: "no_validation_means_available",
    });
  });
});
