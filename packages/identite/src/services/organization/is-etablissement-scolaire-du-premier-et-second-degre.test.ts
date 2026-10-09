//

import { isEtablissementScolaireDuPremierEtSecondDegre } from "#src/services/organization";
import type { Organization } from "#src/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isEtablissementScolaireDuPremierEtSecondDegre", () => {
  it("should return false for unipersonnelle organization", () => {
    const indep_org_info = {
      siret: "90243432300017",
      cached_tranche_effectifs: null,
      cached_tranche_effectifs_unite_legale: null,
      cached_libelle_tranche_effectif: null,
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "1000 ",
      cached_libelle_categorie_juridique: "Entrepreneur individuel",
    } as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(indep_org_info),
      false,
    );
  });
  it("should return true for lycee public", () => {
    const lycee_public_org_info = {
      siret: "19500016100016",
      cached_libelle: "Lycee general et technologique jean francois millet",
      cached_nom_complet: "Lycee general et technologique jean francois millet",
      cached_enseigne: "",
      cached_tranche_effectifs: "22",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "100 à 199 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "1 rue bougainville, 50130 Cherbourg-en-cotentin",
      cached_code_postal: "50130",
      cached_code_officiel_geographique: "50129",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    } as unknown as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_public_org_info),
      true,
    );
  });
  it("should return true for college public", () => {
    const college_public_org_info = {
      siret: "19120032800018",
      cached_libelle: "College albert camus",
      cached_nom_complet: "College albert camus",
      cached_enseigne: "",
      cached_tranche_effectifs: "21",
      cached_tranche_effectifs_unite_legale: "21",
      cached_libelle_tranche_effectif: "50 à 99 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "114 rue de la vallee du viaur, 12160 Baraqueville",
      cached_code_postal: "12160",
      cached_code_officiel_geographique: "12056",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    } as unknown as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(college_public_org_info),
      true,
    );
  });
  it("should return false for lycee prive", () => {
    const lycee_prive_org_info = {
      siret: "31458546400014",
      cached_libelle: "Ogec maitrise de massabielle",
      cached_nom_complet: "Ogec maitrise de massabielle",
      cached_enseigne: "",
      cached_tranche_effectifs: "21",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "50 à 99 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "29 faubourg victor hugo, 97110 Pointe-à-pitre",
      cached_code_postal: "97110",
      cached_code_officiel_geographique: "97120",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "9220",
      cached_libelle_categorie_juridique: "Association déclarée",
    } as unknown as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_prive_org_info),
      false,
    );
  });
  it("should return true for ecole primaire publique", () => {
    const ecole_primaire_publique_org_info: Organization = {
      siret: "21590009300273",
      cached_libelle:
        "Commune de villeneuve d ascq - Ecole primaire publique calmette",
      cached_nom_complet: "Commune de villeneuve d ascq",
      cached_enseigne: "Ecole primaire publique calmette",
      cached_tranche_effectifs: "11",
      cached_tranche_effectifs_unite_legale: "42",
      cached_libelle_tranche_effectif: "10 à 19 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "48 rue de la contrescarpe, 59650 Villeneuve d'ascq",
      cached_code_postal: "59650",
      cached_code_officiel_geographique: "59009",
      cached_activite_principale: "85.20Z",
      cached_libelle_activite_principale: "85.20Z - Enseignement primaire",
      cached_categorie_juridique: "7210",
      cached_libelle_categorie_juridique: "Commune et commune nouvelle",
    } as unknown as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_primaire_publique_org_info,
      ),
      true,
    );
  });
  it("should return false for ecole primaire privee", () => {
    const ecole_primaire_privee_org_info = {
      siret: "39945558300027",
      cached_libelle:
        "Groupe scolaire ste genevieve st joseph (OGEC) - Ecoles primaires ste genevieve st joseph",
      cached_nom_complet: "Groupe scolaire ste genevieve st joseph (OGEC)",
      cached_enseigne: "Ecoles primaires ste genevieve st joseph",
      cached_tranche_effectifs: "11",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "10 à 19 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "1 rue sarrus, 12000 Rodez",
      cached_code_postal: "12000",
      cached_code_officiel_geographique: "12202",
      cached_activite_principale: "85.20Z",
      cached_libelle_activite_principale: "85.20Z - Enseignement primaire",
      cached_categorie_juridique: "9220",
      cached_libelle_categorie_juridique: "Association déclarée",
    } as unknown as Organization;
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_primaire_privee_org_info,
      ),
      false,
    );
  });
});
