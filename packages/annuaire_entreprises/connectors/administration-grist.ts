//

import { request } from "../../../src/connectors/request.js";

type administrationGristRecord = {
  id: number;
  fields: {
    Code_juridique: number;
    Libelle: string;
    Mission_de_service_public_administratif: boolean;
    Administration_de_l_Etat_services_centraux_deconcentres_et_criteres_de_regie_ou_quasi_regie_: boolean;
    Collectivites: boolean;
  };
};

export function fetchAdministrationGristRecordsFactory({
  documentUrl,
  apiKey,
}: {
  documentUrl: string;
  apiKey: string;
}) {
  return async function fetchAdministrationGristRecords() {
    const { data } = await request<{ records: administrationGristRecord[] }>(
      documentUrl,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      },
    );
    return data.records.map((record) => ({
      codeJuridique: record.fields.Code_juridique,
      libelle: record.fields.Libelle.trim(),
      isAdministrationEtat:
        record.fields
          .Administration_de_l_Etat_services_centraux_deconcentres_et_criteres_de_regie_ou_quasi_regie_,
      isCollectivite: record.fields.Collectivites,
      isServicePublicAdministratif:
        record.fields.Mission_de_service_public_administratif,
    }));
  };
}
