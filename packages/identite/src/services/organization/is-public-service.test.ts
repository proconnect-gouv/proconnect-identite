//

import type { Organization } from "#src/types";
import {
  association_org_info,
  dinum_org_info,
  entreprise_unipersonnelle_org_info,
  lamalou_org_info,
  onf_org_info,
  trackdechets_public_org_info,
  whitelisted_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicService } from "./is-public-service.js";

describe("isPublicService", () => {
  it("should return false for bad call", () => {
    assert.equal(isPublicService({} as Organization), false);
  });

  it("should return true for collectivite territoriale", () => {
    assert.equal(isPublicService(lamalou_org_info), true);
  });

  it("should return true for administration centrale", () => {
    assert.equal(isPublicService(dinum_org_info), true);
  });

  it("should return false for unipersonnelle organization", () => {
    assert.equal(isPublicService(entreprise_unipersonnelle_org_info), false);
  });

  it("should return false for association", () => {
    assert.equal(isPublicService(association_org_info), false);
  });

  it("should return true for établissement public à caractère industriel et commercial", () => {
    assert.equal(isPublicService(onf_org_info), true);
  });

  it("should return true for whitelisted établissement", () => {
    assert.equal(isPublicService(whitelisted_org_info), true);
  });

  it("should return true for public etablissement", () => {
    assert.equal(isPublicService(trackdechets_public_org_info), true);
  });

  // Tests for new comprehensive implementation
  it("should return false for blacklisted SIREN", () => {
    const blacklisted_org = {
      siret: "34867901000123",
      cached_categorie_juridique: "7120",
      cached_etat_administratif: "A",
    } as Organization;
    assert.equal(isPublicService(blacklisted_org), false);
  });

  it("should return false for closed entities", () => {
    const closed_org = {
      siret: "12345678900123",
      cached_categorie_juridique: "7120",
      cached_etat_administratif: "C",
    } as Organization;
    assert.equal(isPublicService(closed_org), false);
  });

  it("should return true for entities with exact nature juridique codes", () => {
    const exact_nature_org = {
      siret: "12345678900123",
      cached_categorie_juridique: "7111",
      cached_etat_administratif: "A",
    } as Organization;
    assert.equal(isPublicService(exact_nature_org), true);
  });

  it("should return true for whitelisted SIREN even with non-public nature juridique", () => {
    const whitelisted_siren_org = {
      siret: "13003013300123",
      cached_categorie_juridique: "5599", // Non-public nature juridique
      cached_etat_administratif: "A",
    } as Organization;
    assert.equal(isPublicService(whitelisted_siren_org), true);
  });

  it("should return true for CARSAT BRETAGNE (service public whitelist)", () => {
    const carsat_bretagne_org = {
      siret: "77774932600123",
      cached_categorie_juridique: "5599", // Non-public nature juridique
      cached_etat_administratif: "A",
    } as Organization;
    assert.equal(isPublicService(carsat_bretagne_org), true);
  });
});
