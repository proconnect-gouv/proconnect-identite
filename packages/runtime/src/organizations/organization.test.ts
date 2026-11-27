//

import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import type { OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

const siret = "11111111111111";

const organization_info = {
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

async function given() {
  const db = await createTestDatabase();
  return {
    journal: () => readActivityLogs(db),
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

function organizationActivity(action: string, context: unknown) {
  return {
    action,
    actor_ref: "1",
    actor_type: "user",
    app: "proconnect-identite",
    cause_activity_id: null,
    context,
    interaction_cid: null,
    moderation_id: null,
    organization_id: 1,
    user_id: null,
  };
}

describe("organization.created", () => {
  it("✅ journals the insert, not an existing organization", async () => {
    const { journal, runtime } = await given();

    await runtime.organization.created.mutate({ organization_info, siret });
    const outcome = await runtime.organization.created.mutate({
      organization_info,
      siret,
    });

    assert.deepEqual(outcome, { kind: "organization_exists" });
    assert.deepEqual(await journal(), [
      organizationActivity("organization.created", {
        inputs: { siret },
        outcome: {},
      }),
    ]);
  });
});

describe("organization.info_changed", () => {
  it("✅ journals both values of each changed field only", async () => {
    const { journal, runtime } = await given();
    await runtime.organization.created.mutate({ organization_info, siret });

    const unchanged = await runtime.organization.info_changed.mutate({
      organization_info,
      siret,
    });
    await runtime.organization.info_changed.mutate({
      organization_info: {
        ...organization_info,
        estActive: false,
        etatAdministratif: "F",
      },
      siret,
    });

    assert.deepEqual(unchanged, {
      kind: "organization_info_unchanged",
      organization_id: 1,
    });
    assert.deepEqual((await journal()).slice(1), [
      organizationActivity("organization.info_changed", {
        inputs: { siret },
        outcome: {
          next: { cached_est_active: false, cached_etat_administratif: "F" },
          previous: { cached_est_active: true, cached_etat_administratif: "A" },
        },
      }),
    ]);
  });
});
