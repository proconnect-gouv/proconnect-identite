//

import type { Organization } from "#src/types";
import {
  association_org_info,
  bpifrance_org_info,
  dinum_org_info,
  entreprise_unipersonnelle_org_info,
  lamalou_org_info,
  onf_org_info,
  trackdechets_public_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeIsServicePublic } from "./is-public-service.js";

describe("computeIsServicePublic", () => {
  it("should return false for bad call", () => {
    const result = computeIsServicePublic({} as Organization);
    assert.equal(result.isServicePublic, false);
  });

  it("should return true for collectivite territoriale", () => {
    const result = computeIsServicePublic(lamalou_org_info);
    assert.equal(result.isServicePublic, true);
  });

  it("should return true for administration centrale", () => {
    const result = computeIsServicePublic(dinum_org_info);
    assert.equal(result.isServicePublic, true);
    assert.equal(result.isAdministrationEtat, true);
  });

  it("should return false for unipersonnelle organization", () => {
    const result = computeIsServicePublic(entreprise_unipersonnelle_org_info);
    assert.equal(result.isServicePublic, false);
  });

  it("should return false for association", () => {
    const result = computeIsServicePublic(association_org_info);
    assert.equal(result.isServicePublic, false);
  });

  it("should return true for établissement public à caractère industriel et commercial", () => {
    const result = computeIsServicePublic(onf_org_info);
    assert.equal(result.isServicePublic, true);
  });

  it.skip("should return true for whitelisted établissement (BIP)", () => {
    const result = computeIsServicePublic(bpifrance_org_info);
    assert.equal(result.isServicePublic, true);
  });

  it("should return true for public etablissement", () => {
    const result = computeIsServicePublic(trackdechets_public_org_info);
    assert.equal(result.isServicePublic, true);
  });

  it("should return false for blacklisted SIREN", () => {
    const blacklisted_org = {
      siret: "34867901000123",
      cached_categorie_juridique: "7120",
      cached_etat_administratif: "A",
    } as Organization;
    const result = computeIsServicePublic(blacklisted_org);
    assert.equal(result.isServicePublic, false);
  });

  it("should return false for closed entities", () => {
    const closed_org = {
      siret: "12345678900123",
      cached_categorie_juridique: "7120",
      cached_etat_administratif: "C",
    } as Organization;
    const result = computeIsServicePublic(closed_org);
    assert.equal(result.isServicePublic, false);
  });

  it("should return true for entities with exact nature juridique codes", () => {
    const exact_nature_org = {
      siret: "12345678900123",
      cached_categorie_juridique: "7111",
      cached_etat_administratif: "A",
    } as Organization;
    const result = computeIsServicePublic(exact_nature_org);
    assert.equal(result.isServicePublic, true);
  });

  it("should return true for CARSAT BRETAGNE (annuaire-entreprises whitelist)", () => {
    const carsat_bretagne_org = {
      siret: "77774932600123",
      cached_categorie_juridique: "8110", // Régime général de la Sécurité Sociale
      cached_etat_administratif: "A",
    } as Organization;
    const result = computeIsServicePublic(carsat_bretagne_org);
    assert.equal(result.isServicePublic, true);
  });
});
