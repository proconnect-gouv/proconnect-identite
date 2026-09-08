//

import { request } from "../../../src/connectors/request.js";

type codeJuridiqueToAdministrationGristRecord = {
  id: number;
  fields: {
    Code_juridique: number;
    Libelle: string;
    Mission_de_service_public_administratif: boolean;
    Administration_de_l_Etat_services_centraux_deconcentres_et_criteres_de_regie_ou_quasi_regie_: boolean;
    Collectivites: boolean;
  };
};

type administrationBlacklistGristRecord = {
  id: number;
  fields: {
    siren: string;
    denomination: string;
  };
};

type administrationWhitelistGristRecord = {
  id: number;
  fields: {
    siren: string;
    denomination: string;
    Administration_de_l_Etat_services_centraux_deconcentres_et_criteres_de_regie_ou_quasi_regie_: boolean;
  };
};

export function fetchCodeJuridiqueToAdministrationGristRecordsFactory({
  documentUrl,
  apiKey,
}: {
  documentUrl: string;
  apiKey: string;
}) {
  return async function fetchCodeJuridiqueToAdministrationGristRecords() {
    const { data } = await request<{
      records: codeJuridiqueToAdministrationGristRecord[];
    }>(documentUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
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

export function fetchAdministrationBlacklistGristRecordsFactory({
  documentUrl,
  apiKey,
}: {
  documentUrl: string;
  apiKey: string;
}) {
  return async function fetchAdministrationBlacklistGristRecords() {
    const { data } = await request<{
      records: administrationBlacklistGristRecord[];
    }>(documentUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return data.records.map((record) => ({
      siren: record.fields.siren,
      denomination: record.fields.denomination,
    }));
  };
}

export function fetchAdministrationWhitelistGristRecordsFactory({
  documentUrl,
  apiKey,
}: {
  documentUrl: string;
  apiKey: string;
}) {
  return async function fetchAdministrationWhitelistGristRecords() {
    const { data } = await request<{
      records: administrationWhitelistGristRecord[];
    }>(documentUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return data.records.map((record) => ({
      siren: record.fields.siren,
      denomination: record.fields.denomination,
      Administration_de_l_Etat_services_centraux_deconcentres_et_criteres_de_regie_ou_quasi_regie_:
        record.fields
          .Administration_de_l_Etat_services_centraux_deconcentres_et_criteres_de_regie_ou_quasi_regie_,
    }));
  };
}
