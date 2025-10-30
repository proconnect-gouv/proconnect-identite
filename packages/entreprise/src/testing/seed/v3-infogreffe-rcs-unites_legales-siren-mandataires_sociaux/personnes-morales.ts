//

import type { InfogreffeSirenMandatairesSociaux } from "@proconnect-gouv/proconnect.api_entreprise/types";

//

export const SocietePresidenteMandataire: InfogreffeSirenMandatairesSociaux = {
  fonction: "PRESIDENT",
  numero_identification: "123456789",
  raison_sociale: "HOLDING ENTREPRISE - SOCIETE PAR ACTIONS SIMPLIFIEE",
  code_greffe: "9201",
  libelle_greffe: "NANTERRE",
  type: "personne_morale",
};

export const CommissaireComptesMandataire: InfogreffeSirenMandatairesSociaux = {
  fonction: "COMMISSAIRE AUX COMPTES TITULAIRE",
  numero_identification: "987654321",
  raison_sociale: "AUDIT & CO - SOCIETE ANONYME",
  code_greffe: "7501",
  libelle_greffe: "PARIS",
  type: "personne_morale",
};
