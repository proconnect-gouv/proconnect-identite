//

import "#src/types";
import {
  OrganizationInfoSchema,
  type Organization,
  type OrganizationInfo,
} from "#src/types";
import {
  formatAddress,
  formatMainActivity,
  formatNomComplet,
  libelleFromCodeEffectif,
} from "@proconnect-gouv/proconnect.api_entreprise/formatters";
import type { InseeSireneEstablishmentSiretResponseData } from "@proconnect-gouv/proconnect.api_entreprise/types";
import { capitalize } from "lodash-es";

//

export function toOrganizationInfo(
  siretData: InseeSireneEstablishmentSiretResponseData,
): OrganizationInfo {
  const isPartiallyNonDiffusible =
    siretData.status_diffusion === "partiellement_diffusible";
  const enseigne = siretData.enseigne ?? "";
  const nomComplet = isPartiallyNonDiffusible
    ? "Nom inconnu"
    : formatNomComplet({
        denominationUniteLegale:
          siretData.unite_legale.personne_morale_attributs.raison_sociale ?? "",
        nomUniteLegale:
          siretData.unite_legale.personne_physique_attributs.nom_naissance,
        nomUsageUniteLegale:
          siretData.unite_legale.personne_physique_attributs.nom_usage,
        prenomUsuelUniteLegale:
          siretData.unite_legale.personne_physique_attributs.prenom_usuel,
        sigleUniteLegale:
          siretData.unite_legale.personne_morale_attributs.sigle,
      });
  const libelle = isPartiallyNonDiffusible
    ? "Nom inconnu"
    : `${nomComplet}${enseigne ? ` - ${capitalize(enseigne)}` : ""}`;

  const trancheEffectifs = isPartiallyNonDiffusible
    ? null
    : siretData.tranche_effectif_salarie.code;
  const trancheEffectifsUniteLegale = isPartiallyNonDiffusible
    ? null
    : siretData.unite_legale.tranche_effectif_salarie.code;
  const codePostal = isPartiallyNonDiffusible
    ? siretData.adresse.code_commune
    : siretData.adresse.code_postal;

  return OrganizationInfoSchema.parse({
    activitePrincipale: siretData.activite_principale.code ?? "",
    adresse: formatAddress(siretData.adresse),
    categorieJuridique: siretData.unite_legale.forme_juridique.code ?? "",
    codeOfficielGeographique: siretData.adresse.code_commune ?? "",
    codePostal,
    enseigne,
    estActive: siretData.etat_administratif === "A",
    estDiffusible: siretData.status_diffusion === "diffusible",
    etatAdministratif: siretData.unite_legale.etat_administratif,
    libelle,
    libelleActivitePrincipale: formatMainActivity(
      siretData.activite_principale,
    ),
    libelleCategorieJuridique: siretData.unite_legale.forme_juridique.libelle,
    libelleTrancheEffectif: libelleFromCodeEffectif(
      siretData.tranche_effectif_salarie.intitule,
      siretData.tranche_effectif_salarie.date_reference,
    ),
    nomComplet,
    siret: siretData.siret,
    statutDiffusion: siretData.status_diffusion,
    trancheEffectifs,
    trancheEffectifsUniteLegale,
  });
}

export function toPartialOrganization(organization_info: OrganizationInfo) {
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
    cached_statut_diffusion,
    cached_tranche_effectifs_unite_legale,
    cached_tranche_effectifs,
    siret,
  } satisfies Omit<
    Organization,
    "created_at" | "id" | "updated_at" | "organization_info_fetched_at"
  >;
}
