import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { type OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { organizationUpserted } from "./organization-upserted";

function organizationInfo(siret: string) {
  return {
    activitePrincipale: "70.22Z",
    adresse: "1 place maurice gunsbourg, 92140 Clamart",
    categorieJuridique: "5210",
    codeOfficielGeographique: "92023",
    codePostal: "92140",
    denominationUsuelleEtablissementPrincipal: null,
    enseigne: "",
    estActive: true,
    estDiffusible: true,
    etatAdministratif: "A",
    libelle: "MAIRIE DE CLAMART",
    libelleActivitePrincipale: "Activité des sièges sociaux",
    libelleCategorieJuridique: "Commune et commune nouvelle",
    libelleTrancheEffectif: "3 à 5 salariés",
    nomComplet: "MAIRIE DE CLAMART",
    siegeSocial: true,
    siret,
    statutDiffusion: "diffusible",
    trancheEffectifs: "12",
    trancheEffectifsUniteLegale: null,
  } satisfies OrganizationInfo;
}

async function given() {
  const pg = new PGlite();
  await migrate(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);
  await db.insert(schema.users).values({
    created_at: new Date("4444-04-04"),
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: new Date("4444-04-04"),
  });

  return {
    journal: () =>
      db.query.activity_logs.findMany({
        columns: {
          created_at: false,
          id: false,
          moderation_id: false,
        },
        orderBy: (table, { asc }) => asc(table.id),
      }),
    organizations: () =>
      db.query.organizations.findMany({
        columns: {
          created_at: false,
          id: true,
          siret: true,
          updated_at: false,
          cached_libelle: true,
          cached_est_active: true,
          cached_tranche_effectifs: true,
          organization_info_fetched_at: false,
        },
        orderBy: (table, { asc }) => asc(table.id),
      }),
    runtime: createIdentiteRuntime({
      app: "proconnect-identite",
      db,
      procedures: { organization: { upserted: organizationUpserted } },
    }).as({ type: "user", user_id: 1 }),
  };
}

describe("organization.upserted", () => {
  it("✅ inserts then updates the same organization and journals each change", async () => {
    const { journal, organizations, runtime } = await given();

    const inserted = await runtime.organization.upserted.mutate({
      organization_info: organizationInfo("11111111111111"),
      siret: "11111111111111",
    });
    assert.equal(inserted.kind, "organization_upserted");
    assert.equal(inserted.activity_id, 1);
    assert.equal(inserted.organization_id, 1);

    const updated = await runtime.organization.upserted.mutate({
      organization_info: organizationInfo("11111111111111"),
      siret: "11111111111111",
    });
    assert.equal(updated.kind, "organization_upserted");
    assert.equal(updated.activity_id, 2);
    assert.equal(updated.organization_id, 1);

    assert.deepEqual(await organizations(), [
      {
        id: 1,
        siret: "11111111111111",
        cached_libelle: "MAIRIE DE CLAMART",
        cached_est_active: true,
        cached_tranche_effectifs: "12",
      },
    ]);

    assert.deepEqual(await journal(), [
      {
        action: "organization.upserted",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { siret: "11111111111111" },
          outcome: { created: true },
        },
        interaction_cid: null,
        organization_id: 1,
        user_id: null,
      },
      {
        action: "organization.upserted",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { siret: "11111111111111" },
          outcome: { created: false },
        },
        interaction_cid: null,
        organization_id: 1,
        user_id: null,
      },
    ]);
  });
});
