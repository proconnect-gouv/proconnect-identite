//

import type { components } from "#openapi";

//

export type Records = components["schemas"]["records"];
export type Record = components["schemas"]["record"];

//

export type SelectedAdministrationRecord = {
  adresse_courriel?: string;
  adresse?: string;
  nom?: string;
};
export type ApiLannuaireAdministrationRecords = Records & {
  results: SelectedAdministrationRecord[];
};
export type ApiLannuaireAdministrationRecord =
  ApiLannuaireAdministrationRecords["results"][0];

//

export type ApiAnnuaireEducationNationaleRecords = Records & {
  results: {
    nom_etablissement?: string;
    mail?: string;
  }[];
};
export type ApiAnnuaireEducationNationaleRecord =
  ApiAnnuaireEducationNationaleRecords["results"][0];
