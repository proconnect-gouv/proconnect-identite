//

import { OrganizationNotFoundError } from "#src/errors";
import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { getByIdFactory } from "./get-by-id.js";

//

const getById = getByIdFactory({ pg: pg as any });

suite("getByIdFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should find a user by id", async () => {
    await pg.sql`
      INSERT INTO organizations
        (cached_libelle, cached_nom_complet, id, siret, created_at, updated_at)
      VALUES
        ('Necron', 'Necrontyr', 1, '⚰️', '1967-12-19', '1967-12-19')
      ;
    `;

    const organization = await getById(1);

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
      cached_libelle_activite_principale: null,
      cached_libelle_categorie_juridique: null,
      cached_libelle_tranche_effectif: null,
      cached_libelle: "Necron",
      cached_nom_complet: "Necrontyr",
      cached_siege_social: null,
      cached_statut_diffusion: null,
      cached_tranche_effectifs_unite_legale: null,
      cached_tranche_effectifs: null,
      created_at: new Date("1967-12-19"),
      organization_info_fetched_at: null,
      id: 1,
      siret: "⚰️",
      updated_at: new Date("1967-12-19"),
    });
  });

  test("❎ fail to find the God-Emperor of Mankind", async () => {
    await assert.rejects(
      getById(42),
      new OrganizationNotFoundError("Organization not found"),
    );
  });
});
