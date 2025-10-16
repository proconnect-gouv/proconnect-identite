import type { InseeSireneEstablishmentSiretResponseData } from "@proconnect-gouv/proconnect.api_entreprise/types";

export const PEOPLE = new Map<
  string,
  {
    readonly adresse: InseeSireneEstablishmentSiretResponseData["adresse"];
    readonly personne_physique_attributs: InseeSireneEstablishmentSiretResponseData["unite_legale"]["personne_physique_attributs"];
  }
>([
  [
    "94957325700019",
    {
      adresse: {
        acheminement_postal: {
          l1: "ROGAL DORN",
          l2: "PHALANX",
          l3: "7 IMPERIAL PALACE",
          l4: "IMPERIAL FISTS CHAPTER",
          l5: "00007 TERRA",
          l6: "TER07 SEGMENTUM SOLAR",
          l7: "IMPERIUM OF MAN",
        },
        code_cedex: "TER07",
        code_commune: "00007",
        code_pays_etranger: null,
        code_postal: "00007",
        complement_adresse: "PHALANX",
        distribution_speciale: "IMPERIAL FISTS CHAPTER",
        indice_repetition_voie: null,
        libelle_cedex: "SEGMENTUM SOLAR",
        libelle_commune_etranger: null,
        libelle_commune: "TERRA",
        libelle_pays_etranger: null,
        libelle_voie: "IMPERIAL PALACE",
        numero_voie: "7",
        status_diffusion: "partiellement_diffusible",
        type_voie: "PLACE",
      },
      personne_physique_attributs: {
        nom_naissance: "DORN",
        nom_usage: "DORN",
        prenom_1: "ROGAL",
        prenom_2: "AURELIUS",
        prenom_3: "IMPERIUS",
        prenom_4: null,
        prenom_usuel: "ROGAL",
        pseudonyme: "PRAETORIAN",
        sexe: "M",
      },
    },
  ],
]);
