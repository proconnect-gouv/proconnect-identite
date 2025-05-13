//
// WARNING(douglasduteil): 00557246600026 is a non diffusable establishment !
// Most fields are manually anonymized with a 40k character random string.
// @see https://annuaire-entreprises.data.gouv.fr/etablissement/00557246600026
//

import type { InseeSiretEstablishment } from "#src/types";

export default {
  siret: "00557246600026",
  siege_social: true,
  etat_administratif: "F",
  date_fermeture: 946594800,
  enseigne: null,
  activite_principale: {
    code: "70.2A",
    nomenclature: "NAF1993",
    libelle: "ancienne révision NAF (NAF1993) non supportée",
  },
  tranche_effectif_salarie: {
    de: null,
    a: null,
    code: null,
    date_reference: null,
    intitule: null,
  },
  diffusable_commercialement: false,
  status_diffusion: "partiellement_diffusible",
  date_creation: 599612400,
  unite_legale: {
    siren: "005572466",
    rna: null,
    siret_siege_social: "00557246600026",
    type: "personne_physique",
    personne_morale_attributs: {
      raison_sociale: null,
      sigle: null,
    },
    personne_physique_attributs: {
      pseudonyme: "LORD OF MACRAGGE",
      prenom_usuel: "MARNEUS",
      prenom_1: "MARNEUS",
      prenom_2: "AUGUSTUS",
      prenom_3: "ROBOUTE",
      prenom_4: null,
      nom_usage: "CALGAR",
      nom_naissance: "CALGAR",
      sexe: "M",
    },
    categorie_entreprise: null,
    status_diffusion: "partiellement_diffusible",
    diffusable_commercialement: false,
    forme_juridique: {
      code: "1000",
      libelle: "Entrepreneur individuel",
    },
    activite_principale: {
      code: "70.2A",
      nomenclature: "NAFRev1",
      libelle: "ancienne révision NAF (NAFRev1) non supportée",
    },
    tranche_effectif_salarie: {
      de: null,
      a: null,
      code: null,
      date_reference: null,
      intitule: null,
    },
    economie_sociale_et_solidaire: null,
    date_creation: 599612400,
    etat_administratif: "C",
  },
  adresse: {
    status_diffusion: "partiellement_diffusible",
    complement_adresse: "FORTRESS OF HERA",
    numero_voie: "1",
    indice_repetition_voie: null,
    type_voie: "BOULEVARD",
    libelle_voie: "EMPEROR'S PLAZA",
    code_postal: "90001",
    libelle_commune: "LE CROISIC",
    libelle_commune_etranger: null,
    distribution_speciale: "ULTRAMAR SECTOR",
    code_commune: "44049",
    code_cedex: "UL-90001",
    libelle_cedex: "MACRAGGE PRIME",
    code_pays_etranger: null,
    libelle_pays_etranger: null,
    acheminement_postal: {
      l1: "MARNEUS CALGAR",
      l2: "FORTRESS OF HERA",
      l3: "1 BOULEVARD EMPEROR'S PLAZA",
      l4: "90001 LE CROISIC",
      l5: "ULTRAMAR SECTOR",
      l6: "UL-90001 MACRAGGE PRIME",
      l7: "FRANCE",
    },
  },
} as InseeSiretEstablishment;
