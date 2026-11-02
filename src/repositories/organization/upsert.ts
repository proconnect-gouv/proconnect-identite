//

import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { to_organization } from "./to-organization.js";

//

export function upsertFactory({ db }: DatabaseContext) {
  return async function upsert({
    siret,
    organizationInfo,
  }: {
    siret: string;
    organizationInfo: OrganizationInfo;
  }) {
    const organization = toPartialOrganization(organizationInfo);
    const changed = {
      ...organization,
      organization_info_fetched_at: sql`now()`,
      siret,
      updated_at: sql`now()`,
    };

    return db.transaction(async (tx) => {
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
            .returning()
        : await tx
            .insert(organizations)
            .values({ ...changed, created_at: sql`now()` })
            .onConflictDoUpdate({
              set: changed,
              target: organizations.siret,
            })
            .returning();

      return to_organization(row);
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
