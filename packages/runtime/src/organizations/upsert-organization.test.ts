//

import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import type { OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

const organization_info: OrganizationInfo = {
  activitePrincipale: "84.11Z",
  adresse: "1 rue de la Paix",
  categorieJuridique: "7120",
  codeOfficielGeographique: "75102",
  codePostal: "75002",
  denominationUsuelleEtablissementPrincipal: null,
  enseigne: "Préfecture",
  estActive: true,
  estDiffusible: true,
  etatAdministratif: "A",
  libelle: "Préfecture de Paris",
  libelleActivitePrincipale: "Administration publique générale",
  libelleCategorieJuridique: "Service déconcentré",
  libelleTrancheEffectif: "50 à 99 salariés",
  nomComplet: "Préfecture de Paris",
  siegeSocial: true,
  siret: "13002526500013",
  statutDiffusion: "diffusible",
  trancheEffectifs: "52",
  trancheEffectifsUniteLegale: "S",
};

const expected_organization = {
  cached_activite_principale: "84.11Z",
  cached_adresse: "1 rue de la Paix",
  cached_categorie_juridique: "7120",
  cached_code_officiel_geographique: "75102",
  cached_code_postal: "75002",
  cached_denomination_usuelle_etablissement_principal: null,
  cached_enseigne: "Préfecture",
  cached_est_active: true,
  cached_est_diffusible: true,
  cached_etat_administratif: "A",
  cached_libelle: "Préfecture de Paris",
  cached_libelle_activite_principale: "Administration publique générale",
  cached_libelle_categorie_juridique: "Service déconcentré",
  cached_libelle_tranche_effectif: "50 à 99 salariés",
  cached_nom_complet: "Préfecture de Paris",
  cached_siege_social: true,
  cached_statut_diffusion: "diffusible",
  cached_tranche_effectifs: "52",
  cached_tranche_effectifs_unite_legale: "S",
};

async function setup() {
  const db = await createTestDatabase();

  return {
    db,
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("upsertOrganization", () => {
  it("✅ creates the organization and journals the INSEE answer", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.upsertOrganization({
      organization_info,
      siret: organization_info.siret,
    });

    assert.deepEqual(outcome, {
      kind: "organization_upserted",
      activity_id: 1,
      organization_id: 1,
    });

    const [organization] = await db.query.organizations.findMany();
    const {
      created_at,
      organization_info_fetched_at,
      updated_at,
      ...cached
    } = organization;
    assert.deepEqual(cached, {
      ...expected_organization,
      id: 1,
      siret: organization_info.siret,
    });
    assert.ok(created_at);
    assert.ok(organization_info_fetched_at);
    assert.ok(updated_at);

    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "organization.upserted",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {
            organization: expected_organization,
            siret: organization_info.siret,
          },
          outcome: { organization_id: 1 },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: null,
      },
    ]);
  });

  it("✅ updates the cached fields and keeps created_at", async () => {
    const { db, runtime } = await setup();
    await db.insert(schema.organizations).values({
      created_at: "1967-12-19",
      id: 1,
      siret: organization_info.siret,
      updated_at: "1967-12-19",
    });

    const outcome = await runtime.upsertOrganization({
      organization_info,
      siret: organization_info.siret,
    });

    assert.deepEqual(outcome, {
      kind: "organization_upserted",
      activity_id: 1,
      organization_id: 1,
    });

    const [organization] = await db.query.organizations.findMany();
    const { created_at, organization_info_fetched_at, updated_at, ...cached } =
      organization;
    assert.deepEqual(cached, {
      ...expected_organization,
      id: 1,
      siret: organization_info.siret,
    });
    assert.match(created_at, /^1967-12-19/);
    assert.ok(organization_info_fetched_at);
    assert.ok(updated_at);
  });
});
