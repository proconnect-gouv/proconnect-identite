import type { InseeSiretEstablishment } from "#src/types";

export default {
  siret: "82271212100018",
  siege_social: true,
  etat_administratif: "A",
  date_fermeture: null,
  enseigne: null,
  activite_principale: {
    code: "70.10Z",
    nomenclature: "NAFRev2",
    libelle: "Activités des sièges sociaux",
  },
  tranche_effectif_salarie: {
    de: null,
    a: null,
    code: null,
    date_reference: null,
    intitule: null,
  },
  diffusable_commercialement: true,
  status_diffusion: "diffusible",
  date_creation: 1472680800,
  unite_legale: {
    siren: "822712121",
    rna: null,
    siret_siege_social: "82271212100018",
    type: "personne_morale",
    personne_morale_attributs: {
      raison_sociale: "NINTENDO OF EUROPE SE",
      sigle: null,
    },
    personne_physique_attributs: {
      pseudonyme: null,
      prenom_usuel: null,
      prenom_1: null,
      prenom_2: null,
      prenom_3: null,
      prenom_4: null,
      nom_usage: null,
      nom_naissance: null,
      sexe: null,
    },
    categorie_entreprise: "PME",
    status_diffusion: "diffusible",
    diffusable_commercialement: true,
    forme_juridique: {
      code: "5800",
      libelle: "Société européenne",
    },
    activite_principale: {
      code: "46.51Z",
      nomenclature: "NAFRev2",
      libelle:
        "Commerce de gros (commerce interentreprises) d'ordinateurs, d'équipements informatiques périphériques et de logiciels",
    },
    tranche_effectif_salarie: {
      de: null,
      a: null,
      code: null,
      date_reference: null,
      intitule: null,
    },
    economie_sociale_et_solidaire: false,
    date_creation: 1472680800,
    etat_administratif: "A",
  },
  adresse: {
    status_diffusion: "diffusible",
    complement_adresse: null,
    // NOTE(douglasduteil): numero_voie can be null in real life
    // Yes, sadly, the openapi is lying to use here :sad:
    numero_voie: null as any,
    indice_repetition_voie: null,
    type_voie: null,
    libelle_voie: "GOLDSTEINSTRASSE 235",
    // NOTE(douglasduteil): code_postal can be null in real life
    // Yes, sadly, the openapi is lying to use here :sad:
    code_postal: null as any,
    libelle_commune: null,
    libelle_commune_etranger: "60528 FRANKFURT AM MAIN",
    distribution_speciale: null,
    code_commune: null,
    code_cedex: null,
    libelle_cedex: null,
    code_pays_etranger: "99109",
    libelle_pays_etranger: "ALLEMAGNE",
    acheminement_postal: {
      l1: "NINTENDO OF EUROPE SE",
      l2: "",
      l3: "",
      l4: "GOLDSTEINSTRASSE 235",
      l5: "",
      l6: "60528 FRANKFURT AM MAIN",
      l7: "ALLEMAGNE",
    },
  },
} as InseeSiretEstablishment;
