//
// WARNING(douglasduteil): 94957325700019 is a non diffusable establishment !
// Most fields are manually anonymized with ▪︎ ▪︎ ▪︎
// @see https://annuaire-entreprises.data.gouv.fr/etablissement/94957325700019
//

import type { InseeSireneEstablishmentSiretResponseData } from "#src/types";

export default {
  siret: "94957325700019",
  siege_social: true,
  etat_administratif: "A",
  date_fermeture: null,
  enseigne: null,
  activite_principale: {
    code: "62.02A",
    nomenclature: "NAFRev2",
    libelle: "Conseil en systèmes et logiciels informatiques",
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
  date_creation: 1678662000,
  unite_legale: {
    siren: "949573257",
    rna: null,
    siret_siege_social: "94957325700019",
    type: "personne_physique",
    personne_morale_attributs: {
      raison_sociale: null,
      sigle: null,
    },
    personne_physique_attributs: {
      pseudonyme: null,
      prenom_usuel: "ROGAL",
      prenom_1: "ROGAL",
      prenom_2: null,
      prenom_3: null,
      prenom_4: null,
      nom_usage: null,
      nom_naissance: "DORN",
      sexe: null,
    },
    categorie_entreprise: null,
    status_diffusion: "partiellement_diffusible",
    diffusable_commercialement: false,
    forme_juridique: {
      code: "1000",
      libelle: "Entrepreneur individuel",
    },
    activite_principale: {
      code: "62.02A",
      nomenclature: "NAFRev2",
      libelle: "Conseil en systèmes et logiciels informatiques",
    },
    tranche_effectif_salarie: {
      de: null,
      a: null,
      code: null,
      date_reference: null,
      intitule: null,
    },
    economie_sociale_et_solidaire: null,
    date_creation: 1678662000,
    etat_administratif: "A",
  },
  adresse: {
    status_diffusion: "partiellement_diffusible",
    complement_adresse: "ADEPTUS MECHANICUS",
    numero_voie: "101",
    indice_repetition_voie: null,
    type_voie: null,
    libelle_voie: "FORGE WORLD BOULEVARD",
    code_postal: "40000",
    libelle_commune: "VALLAURIS",
    libelle_commune_etranger: null,
    distribution_speciale: "MARS SECTOR",
    code_commune: "06155",
    code_cedex: "MARS",
    libelle_cedex: "MARS PRIME",
    code_pays_etranger: null,
    libelle_pays_etranger: null,
    acheminement_postal: {
      l1: "BELISARIUS CAWL",
      l2: "ADEPTUS MECHANICUS",
      l3: "101 FORGE WORLD BOULEVARD",
      l4: "MARS SECTOR",
      l5: "40000",
      l6: "VALLAURIS",
      l7: "FRANCE",
    },
  },
} as InseeSireneEstablishmentSiretResponseData;
