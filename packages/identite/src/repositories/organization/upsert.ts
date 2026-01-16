//

import type {
  DatabaseContext,
  Organization,
  OrganizationInfo,
} from "#src/types";
import type { QueryResult } from "pg";

//

export function upsertFactory({ pg }: DatabaseContext) {
  return async function upsert({
    siret,
    organizationInfo,
  }: {
    siret: string;
    organizationInfo: OrganizationInfo;
  }) {
    const {
      cached_libelle,
      cached_nom_complet,
      cached_enseigne,
      cached_tranche_effectifs,
      cached_tranche_effectifs_unite_legale,
      cached_libelle_tranche_effectif,
      cached_etat_administratif,
      cached_est_active,
      cached_statut_diffusion,
      cached_est_diffusible,
      cached_adresse,
      cached_code_postal,
      cached_code_officiel_geographique,
      cached_activite_principale,
      cached_libelle_activite_principale,
      cached_categorie_juridique,
      cached_libelle_categorie_juridique,
      cached_siege_social,
    } = toPartialOrganization(organizationInfo);

    const { rows }: QueryResult<Organization> = await pg.query(
      `
    INSERT INTO organizations
      (
        siret,
        cached_libelle,
        cached_nom_complet,
        cached_enseigne,
        cached_tranche_effectifs,
        cached_tranche_effectifs_unite_legale,
        cached_libelle_tranche_effectif,
        cached_etat_administratif,
        cached_est_active,
        cached_statut_diffusion,
        cached_est_diffusible,
        cached_adresse,
        cached_code_postal,
        cached_code_officiel_geographique,
        cached_activite_principale,
        cached_libelle_activite_principale,
        cached_categorie_juridique,
        cached_libelle_categorie_juridique,
        cached_siege_social,
        organization_info_fetched_at,
        updated_at,
        created_at
      )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    ON CONFLICT (siret)
    DO UPDATE
    SET (
        siret,
        cached_libelle,
        cached_nom_complet,
        cached_enseigne,
        cached_tranche_effectifs,
        cached_tranche_effectifs_unite_legale,
        cached_libelle_tranche_effectif,
        cached_etat_administratif,
        cached_est_active,
        cached_statut_diffusion,
        cached_est_diffusible,
        cached_adresse,
        cached_code_postal,
        cached_code_officiel_geographique,
        cached_activite_principale,
        cached_libelle_activite_principale,
        cached_categorie_juridique,
        cached_libelle_categorie_juridique,
        cached_siege_social,
        organization_info_fetched_at,
        updated_at
    ) = (
        EXCLUDED.siret,
        EXCLUDED.cached_libelle,
        EXCLUDED.cached_nom_complet,
        EXCLUDED.cached_enseigne,
        EXCLUDED.cached_tranche_effectifs,
        EXCLUDED.cached_tranche_effectifs_unite_legale,
        EXCLUDED.cached_libelle_tranche_effectif,
        EXCLUDED.cached_etat_administratif,
        EXCLUDED.cached_est_active,
        EXCLUDED.cached_statut_diffusion,
        EXCLUDED.cached_est_diffusible,
        EXCLUDED.cached_adresse,
        EXCLUDED.cached_code_postal,
        EXCLUDED.cached_code_officiel_geographique,
        EXCLUDED.cached_activite_principale,
        EXCLUDED.cached_libelle_activite_principale,
        EXCLUDED.cached_categorie_juridique,
        EXCLUDED.cached_libelle_categorie_juridique,
        EXCLUDED.cached_siege_social,
        EXCLUDED.organization_info_fetched_at,
        EXCLUDED.updated_at
    )
  RETURNING *
  `,
      [
        siret,
        cached_libelle,
        cached_nom_complet,
        cached_enseigne,
        cached_tranche_effectifs,
        cached_tranche_effectifs_unite_legale,
        cached_libelle_tranche_effectif,
        cached_etat_administratif,
        cached_est_active,
        cached_statut_diffusion,
        cached_est_diffusible,
        cached_adresse,
        cached_code_postal,
        cached_code_officiel_geographique,
        cached_activite_principale,
        cached_libelle_activite_principale,
        cached_categorie_juridique,
        cached_libelle_categorie_juridique,
        cached_siege_social,
        new Date(),
        new Date(),
        new Date(),
      ],
    );

    return rows.shift()!;
  };
}

export type UpsertHandler = ReturnType<typeof upsertFactory>;

//

function toPartialOrganization(organization_info: OrganizationInfo) {
  const {
    activitePrincipale: cached_activite_principale,
    adresse: cached_adresse,
    categorieJuridique: cached_categorie_juridique,
    codeOfficielGeographique: cached_code_officiel_geographique,
    codePostal: cached_code_postal,
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
    cached_statut_diffusion,
    cached_tranche_effectifs_unite_legale,
    cached_tranche_effectifs,
    siret,
  } satisfies Omit<
    Organization,
    "created_at" | "id" | "updated_at" | "organization_info_fetched_at"
  >;
}
