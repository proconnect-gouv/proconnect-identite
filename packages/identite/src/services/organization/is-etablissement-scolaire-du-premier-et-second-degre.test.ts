//

import { isEtablissementScolaireDuPremierEtSecondDegre } from "#src/services/organization";
import type { Organization } from "#src/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isEtablissementScolaireDuPremierEtSecondDegre", () => {
  it("should return false for unipersonnelle organization", () => {
    const indep_org_info = {
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "1000",
      cached_libelle_categorie_juridique: "Entrepreneur individuel",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(indep_org_info),
      false,
    );
  });

  it("should return true for lycee public", () => {
    const lycee_public_org_info = {
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_public_org_info),
      true,
    );
  });

  it("should return true for college public", () => {
    const college_public_org_info = {
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(college_public_org_info),
      true,
    );
  });

  it("should return true for lycee professionnel public", () => {
    const lycee_pro_org_info = {
      cached_activite_principale: "85.32Z",
      cached_libelle_activite_principale:
        "85.32Z - Enseignement secondaire technique ou professionnel",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_pro_org_info),
      true,
    );
  });

  it("should return false for lycee prive", () => {
    const lycee_prive_org_info = {
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "9220",
      cached_libelle_categorie_juridique: "Association déclarée",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_prive_org_info),
      false,
    );
  });

  it("should return true for ecole primaire publique", () => {
    const ecole_primaire_publique_org_info = {
      cached_activite_principale: "85.20Z",
      cached_libelle_activite_principale: "85.20Z - Enseignement primaire",
      cached_categorie_juridique: "7210",
      cached_libelle_categorie_juridique: "Commune et commune nouvelle",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_primaire_publique_org_info,
      ),
      true,
    );
  });

  it("should return false for ecole primaire privee", () => {
    const ecole_primaire_privee_org_info = {
      cached_activite_principale: "85.20Z",
      cached_libelle_activite_principale: "85.20Z - Enseignement primaire",
      cached_categorie_juridique: "9220",
      cached_libelle_categorie_juridique: "Association déclarée",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_primaire_privee_org_info,
      ),
      false,
    );
  });

  it("should return true for ecole maternelle publique", () => {
    const ecole_maternelle_publique_org_info = {
      cached_activite_principale: "85.10Z",
      cached_libelle_activite_principale: "85.10Z - Enseignement pré-primaire",
      cached_categorie_juridique: "7210",
      cached_libelle_categorie_juridique: "Commune et commune nouvelle",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_maternelle_publique_org_info,
      ),
      true,
    );
  });

  it("should return false for administration centrale", () => {
    const admin_centrale_org_info = {
      cached_activite_principale: "84.11Z",
      cached_libelle_activite_principale:
        "84.11Z - Administration publique générale",
      cached_categorie_juridique: "7120",
      cached_libelle_categorie_juridique: "Service central d'un ministère",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(admin_centrale_org_info),
      false,
    );
  });
});
