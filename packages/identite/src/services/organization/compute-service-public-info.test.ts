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
import { computeServicePublicInfo } from "./compute-service-public-info.js";

describe("computeServicePublicInfo", () => {
  it("should return false for bad call", () => {
    const result = computeServicePublicInfo({} as Organization);
    assert.equal(result.isServicePublic, false);
  });

  it("should return true for collectivite territoriale", () => {
    const result = computeServicePublicInfo(lamalou_org_info);
    assert.equal(result.isServicePublic, true);
  });

  it("should return true for administration centrale", () => {
    const result = computeServicePublicInfo(dinum_org_info);
    assert.equal(result.isServicePublic, true);
    assert.equal(result.isAdministrationEtat, true);
  });

  it("should return false for unipersonnelle organization", () => {
    const result = computeServicePublicInfo(entreprise_unipersonnelle_org_info);
    assert.equal(result.isServicePublic, false);
  });

  it("should return false for association", () => {
    const result = computeServicePublicInfo(association_org_info);
    assert.equal(result.isServicePublic, false);
  });

  it("should return true for établissement public à caractère industriel et commercial", () => {
    const result = computeServicePublicInfo(onf_org_info);
    assert.equal(result.isServicePublic, true);
  });

  it.skip("should return true for whitelisted établissement (BIP)", () => {
    const result = computeServicePublicInfo(bpifrance_org_info);
    assert.equal(result.isServicePublic, true);
  });

  it("should return true for public etablissement", () => {
    const result = computeServicePublicInfo(trackdechets_public_org_info);
    assert.equal(result.isServicePublic, true);
  });

  it("should return false for blacklisted SIREN", () => {
    const blacklisted_org = {
      siret: "34867901000123",
      cached_categorie_juridique: "7120",
      cached_etat_administratif: "A",
    } as Organization;
    const result = computeServicePublicInfo(blacklisted_org);
    assert.equal(result.isServicePublic, false);
  });

  it("should return false for closed entities", () => {
    const closed_org = {
      siret: "12345678900123",
      cached_categorie_juridique: "7120",
      cached_etat_administratif: "C",
    } as Organization;
    const result = computeServicePublicInfo(closed_org);
    assert.equal(result.isServicePublic, false);
  });

  it("should return true for entities with exact nature juridique codes", () => {
    const exact_nature_org = {
      siret: "12345678900123",
      cached_categorie_juridique: "7111",
      cached_etat_administratif: "A",
    } as Organization;
    const result = computeServicePublicInfo(exact_nature_org);
    assert.equal(result.isServicePublic, true);
  });

  it("should return true for CARSAT BRETAGNE (annuaire-entreprises whitelist)", () => {
    const carsat_bretagne_org = {
      siret: "77774932600123",
      cached_categorie_juridique: "8110", // Régime général de la Sécurité Sociale
      cached_etat_administratif: "A",
    } as Organization;
    const result = computeServicePublicInfo(carsat_bretagne_org);
    assert.equal(result.isServicePublic, true);
  });
});
