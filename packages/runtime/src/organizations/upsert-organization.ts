//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import type { OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";
import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq, sql } from "drizzle-orm";

//

type UpsertOrganizationOutcome = {
  kind: "organization_upserted";
  activity_id: number;
  organization_id: number;
};

export function upsertOrganizationFactory({
  actor,
  app,
  db,
}: RuntimeContext) {
  return function upsertOrganization({
    organization_info,
    siret,
  }: {
    organization_info: OrganizationInfo;
    siret: string;
  }): Promise<UpsertOrganizationOutcome> {
    return db.transaction(async (tx) => {
      const organization = toPartialOrganization(organization_info);
      const changed = {
        ...organization,
        organization_info_fetched_at: sql`now()`,
        siret,
        updated_at: sql`now()`,
      };

      const [existing] = await tx
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.siret, siret))
        .for("update");

      const [row] = existing
        ? await tx
            .update(organizations)
            .set(changed)
            .where(eq(organizations.id, existing.id))
            .returning({ id: organizations.id })
        : await tx
            .insert(organizations)
            .values({ ...changed, created_at: sql`now()` })
            .onConflictDoUpdate({
              set: changed,
              target: organizations.siret,
            })
            .returning({ id: organizations.id });

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "organization.upserted",
        actor,
        app,
        context: {
          inputs: { organization, siret },
          outcome: { organization_id: row.id },
        },
        organization_id: row.id,
      });

      return {
        kind: "organization_upserted",
        activity_id,
        organization_id: row.id,
      };
    });
  };
}

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
    cached_denomination_usuelle_etablissement_principal,
    cached_enseigne,
    cached_est_active,
    cached_est_diffusible,
    cached_etat_administratif,
    cached_libelle,
    cached_libelle_activite_principale,
    cached_libelle_categorie_juridique,
    cached_libelle_tranche_effectif,
    cached_nom_complet,
    cached_siege_social,
    cached_statut_diffusion,
    cached_tranche_effectifs,
    cached_tranche_effectifs_unite_legale,
  };
}
