//

import "#src/types";
import { OrganizationInfoSchema, type OrganizationInfo } from "#src/types";
import {
  formatAddress,
  formatMainActivity,
  formatNomComplet,
  libelleFromCodeEffectif,
} from "@proconnect-gouv/proconnect.entreprise/formatters";
import type { InseeSireneEstablishmentSiretResponseData } from "@proconnect-gouv/proconnect.entreprise/types";
import { capitalize } from "lodash-es";

//

export function fromSiret(
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
  } satisfies OrganizationInfo);
}
