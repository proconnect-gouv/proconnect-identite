import { isEmailValid } from "@proconnect-gouv/proconnect.core/security";
import { isEmpty, isString, uniq } from "lodash-es";
import {
  ANNUAIRE_SERVICE_PUBLIC_API_URL,
  FEATURE_USE_ANNUAIRE_EMAILS,
  HTTP_CLIENT_TIMEOUT,
  TEST_CONTACT_EMAIL,
} from "../config/env";
import {
  ApiAnnuaireConnectionError,
  ApiAnnuaireNotFoundError,
} from "../config/errors";
import { logger } from "../services/log";
import { FetchError, request } from "./request";

// more info at https://api-lannuaire.service-public.fr/api/explore/v2.1/console

type ApiAnnuaireServicePublicReponse = {
  type: "FeatureCollection";
  total_count: number;
  results: {
    site_internet: {
      valeur: string;
    }[];
    nom: string;
    adresse_courriel?: string | null;
    pivot: {
      type_service_local: string;
    }[];
    id: string;
    telephone: {
      valeur: string;
    }[];
    code_insee_commune: string;
    adresse: {
      type_adresse: "Adresse";
      numero_voie: string;
      code_postal: string;
      nom_commune: string;
      longitude: string;
      latitude: string;
    }[];
  }[];
};

export const getAnnuaireServicePublicContactEmails = async (
  codeOfficielGeographique: string | null,
): Promise<string[]> => {
  if (isEmpty(codeOfficielGeographique)) {
    throw new ApiAnnuaireNotFoundError();
  }

  let features: ApiAnnuaireServicePublicReponse["results"] = [];
  try {
    const { data }: { data: ApiAnnuaireServicePublicReponse } =
      await request<ApiAnnuaireServicePublicReponse>(
        `${ANNUAIRE_SERVICE_PUBLIC_API_URL}/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=code_insee_commune LIKE "${codeOfficielGeographique}" and pivot LIKE "mairie"`,
        {
          method: "get",
          headers: {
            accept: "application/json",
          },
          timeout: HTTP_CLIENT_TIMEOUT,
        },
      );

    features = data.results.map((feature) => ({
      ...feature,
      // HACK(douglasduteil): the API returns a string instead of a JSON object in the adresse field
      adresse: JSON.parse(feature.adresse as any),
    }));
  } catch (e) {
    if (e instanceof FetchError) {
      throw new ApiAnnuaireConnectionError(e.message, { cause: e });
    }

    throw e;
  }

  const formattedEmails = uniq(
    features
      .map((feature) => extractFormattedEmailFromFeature(feature))
      .filter(isString),
  );

  if (formattedEmails.length === 0) {
    throw new ApiAnnuaireNotFoundError(
      `No valid email found for: ${codeOfficielGeographique}.`,
      {
        cause: features,
      },
    );
  }

  return formattedEmails;
};

function extractFormattedEmailFromFeature(
  feature: ApiAnnuaireServicePublicReponse["results"][number],
) {
  const { adresse_courriel } = feature;

  if (!adresse_courriel) return;

  if (!isString(adresse_courriel)) return;

  const [formattedEmail] = adresse_courriel.toLowerCase().trim().split(";");

  if (!isEmailValid(formattedEmail)) return;

  if (!FEATURE_USE_ANNUAIRE_EMAILS) {
    logger.info(
      `Test email address ${TEST_CONTACT_EMAIL} was used instead of the real one ${formattedEmail}.`,
    );
    return TEST_CONTACT_EMAIL;
  }
  return formattedEmail;
}
