import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import {
  ApiEntrepriseOrganizationInfoSchema,
  type OrganizationInfo,
} from "@proconnect-gouv/proconnect.identite/types";
import { sql } from "drizzle-orm";
import { z } from "zod";

const { inputs, outcome } =
  activityContextSchemas["organization.upserted"].shape;

const organizationInfoSchema = ApiEntrepriseOrganizationInfoSchema.extend({
  denominationUsuelleEtablissementPrincipal: z.string().nullable(),
});

export const organizationUpserted = procedure
  .inputs(inputs)
  .private(z.object({ organization_info: organizationInfoSchema }))
  .outcome(outcome)
  .mutation(
    async ({ inputs: { siret }, private: { organization_info }, tx }) => {
      const [{ created, organization_id }] = await tx
        .insert(organizations)
        .values({
          ...toPartialOrganization(organization_info),
          organization_info_fetched_at: sql`now()`,
          updated_at: sql`now()`,
          created_at: sql`now()`,
          siret,
        })
        .onConflictDoUpdate({
          target: organizations.siret,
          set: {
            ...toPartialOrganization(organization_info),
            organization_info_fetched_at: sql`now()`,
            updated_at: sql`now()`,
            siret,
          },
        })
        .returning({
          created: sql<boolean>`(xmax = 0)`,
          organization_id: organizations.id,
        });

      return {
        journal: { outcome: { created }, targets: { organization_id } },
        kind: "organization_upserted",
        organization_id,
      } as const;
    },
  );

function toPartialOrganization(organization_info: OrganizationInfo) {
  const {
    activitePrincipale: cached_activite_principale,
    adresse: cached_adresse,
    categorieJuridique: cached_categorie_juridique,
    codeOfficielGeographique: cached_code_officiel_geographique,
    codePostal: cached_code_postal,
    denominationUsuelleEtablissementPrincipal:
      cached_denomination_usuelle_etablissement_principal,
    enseigne: cached_enseigne,
    estActive: cached_est_active,
    estDiffusible: cached_est_diffusible,
    etatAdministratif: cached_etat_administratif,
    libelle: cached_libelle,
    libelleActivitePrincipale: cached_libelle_activite_principale,
    libelleCategorieJuridique: cached_libelle_categorie_juridique,
    libelleTrancheEffectif: cached_libelle_tranche_effectif,
    nomComplet: cached_nom_complet,
    siegeSocial: cached_siege_social,
    siret,
    statutDiffusion: cached_statut_diffusion,
    trancheEffectifs: cached_tranche_effectifs,
    trancheEffectifsUniteLegale: cached_tranche_effectifs_unite_legale,
  } = organization_info;
  return {
    cached_activite_principale,
    cached_adresse,
    cached_categorie_juridique,
    cached_code_officiel_geographique,
    cached_code_postal,
    cached_enseigne,
    cached_est_active,
    cached_est_diffusible,
    cached_etat_administratif,
    cached_libelle_activite_principale,
    cached_libelle_categorie_juridique,
    cached_libelle_tranche_effectif,
    cached_libelle,
    cached_nom_complet,
    cached_siege_social,
    cached_denomination_usuelle_etablissement_principal,
    cached_statut_diffusion,
    cached_tranche_effectifs_unite_legale,
    cached_tranche_effectifs,
    siret,
  };
}
