//

import type { paths } from "#openapi";

//

export type InseeSireneEstablishmentSiretResponseData =
  paths["/v3/insee/sirene/etablissements/{siret}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type InseeAddressEstablishment =
  InseeSireneEstablishmentSiretResponseData["adresse"];
export type InseeMainActivityEstablishment =
  InseeSireneEstablishmentSiretResponseData["activite_principale"];
export type TrancheEffectifs =
  InseeSireneEstablishmentSiretResponseData["tranche_effectif_salarie"]["code"];

//

export type InfogreffeRcseUniteLegalSirenMandatairesSociauxResponseData =
  paths["/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type InfogreffeSirenMandatairesSociaux = NonNullable<
  InfogreffeRcseUniteLegalSirenMandatairesSociauxResponseData[number]["data"]
>;
