//

import { getAnnuaireServicePublicContactEmailFactory } from "@gouvfr-lasuite/proconnect.opendatasoft/api/api-lannuaire.service-public.fr";
import { createOpendatasoftOpenApiClient } from "@gouvfr-lasuite/proconnect.opendatasoft/client";
import {
  FEATURE_USE_ANNUAIRE_EMAILS,
  HTTP_CLIENT_TIMEOUT,
  TEST_CONTACT_EMAIL,
} from "../config/env";
import { logger } from "../services/log";

//

const client = createOpendatasoftOpenApiClient({
  baseUrl: "https://api-lannuaire.service-public.fr/api/explore/v2.1",
});

export const getAnnuaireServicePublicContactEmail = FEATURE_USE_ANNUAIRE_EMAILS
  ? getAnnuaireServicePublicContactEmailFactory(client, () => ({
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    }))
  : () => {
      logger.info(
        `Test email address ${TEST_CONTACT_EMAIL} was used instead of the real one.`,
      );
      return TEST_CONTACT_EMAIL;
    };
