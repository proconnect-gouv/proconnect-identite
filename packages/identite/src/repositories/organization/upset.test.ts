//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, mock, suite, test } from "node:test";
import { upsertFactory } from "./upsert.js";

//

const upset = upsertFactory({ pg: pg as any });

suite("upset", () => {
  before(migrate);
  beforeEach(emptyDatabase);
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });
  });

  test("should create the Tau Empire organization", async () => {
    const organization = await upset({
      organizationInfo: {
        libelle: "Tau Empire",
        nomComplet: "Tau Empire",
      } as any,
      siret: "👽️",
    });

    assert.deepEqual(organization, {
      cached_activite_principale: null,
      cached_adresse: null,
      cached_categorie_juridique: null,
      cached_code_officiel_geographique: null,
      cached_code_postal: null,
      cached_enseigne: null,
      cached_est_active: null,
      cached_est_diffusible: null,
      cached_etat_administratif: null,
      cached_libelle: "Tau Empire",
      cached_libelle_activite_principale: null,
      cached_libelle_categorie_juridique: null,
      cached_libelle_tranche_effectif: null,
      cached_nom_complet: "Tau Empire",
      cached_statut_diffusion: null,
      cached_tranche_effectifs: null,
      cached_tranche_effectifs_unite_legale: null,
      created_at: new Date("4444-04-04"),
      id: 1,
      organization_info_fetched_at: new Date("4444-04-04"),
      siret: "👽️",
      updated_at: new Date("4444-04-04"),
    });
  });

  test("should update the Necron organization", async () => {
    await pg.sql`
      INSERT INTO organizations
        (siret, created_at, updated_at)
      VALUES
        ('⚰️', '1967-12-19', '1967-12-19');
    `;

    const organization = await upset({
      organizationInfo: {
        libelle: "Necron",
        nomComplet: "Necrontyr",
      } as any,
      siret: "⚰️",
    });

    assert.deepEqual(organization, {
      cached_activite_principale: null,
      cached_adresse: null,
      cached_categorie_juridique: null,
      cached_code_officiel_geographique: null,
      cached_code_postal: null,
      cached_enseigne: null,
      cached_est_active: null,
      cached_est_diffusible: null,
      cached_etat_administratif: null,
      cached_libelle: "Necron",
      cached_libelle_activite_principale: null,
      cached_libelle_categorie_juridique: null,
      cached_libelle_tranche_effectif: null,
      cached_nom_complet: "Necrontyr",
      cached_statut_diffusion: null,
      cached_tranche_effectifs: null,
      cached_tranche_effectifs_unite_legale: null,
      created_at: new Date("1967-12-19"),
      id: 1,
      organization_info_fetched_at: new Date("4444-04-04"),
      siret: "⚰️",
      updated_at: new Date("4444-04-04"),
    });
  });
});
