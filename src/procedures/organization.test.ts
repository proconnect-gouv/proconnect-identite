import { type OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { given, userActivity } from "../../testing";
import { organizationUpserted } from "./organization";

const procedures = { organization: { upserted: organizationUpserted } };

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

describe("organization.upserted", () => {
  it("✅ inserts then updates the same organization and journals each upsert", async () => {
    const { journal, runtime } = await given({ procedures });
    const siret = "11111111111111";

    await runtime.organization.upserted.mutate({
      organization_info: organizationInfo(siret),
      siret,
    });
    await runtime.organization.upserted.mutate({
      organization_info: organizationInfo(siret),
      siret,
    });

    assert.deepEqual(await journal(), [
      {
        ...userActivity(
          "organization.upserted",
          { inputs: { siret }, outcome: { created: true } },
          { organization_id: 1 },
        ),
        user_id: null,
      },
      {
        ...userActivity(
          "organization.upserted",
          { inputs: { siret }, outcome: { created: false } },
          { organization_id: 1 },
        ),
        user_id: null,
      },
    ]);
  });
});
