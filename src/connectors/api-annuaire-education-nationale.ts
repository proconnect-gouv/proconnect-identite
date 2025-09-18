//

import { getAnnuaireEducationNationaleContactEmailFactory } from "@gouvfr-lasuite/proconnect.opendatasoft/api/data.education.gouv.fr";
import { createOpendatasoftOpenApiClient } from "@gouvfr-lasuite/proconnect.opendatasoft/client";
import {
  FEATURE_USE_ANNUAIRE_EMAILS,
  HTTP_CLIENT_TIMEOUT,
  TEST_CONTACT_EMAIL,
} from "../config/env";
import { logger } from "../services/log";

//

const client = createOpendatasoftOpenApiClient({
  baseUrl: "https://data.education.gouv.fr/api/v2.1",
});

export const getAnnuaireEducationNationaleContactEmail =
  FEATURE_USE_ANNUAIRE_EMAILS
    ? getAnnuaireEducationNationaleContactEmailFactory(client, () => ({
        signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
      }))
    : () => {
        logger.info(
          `Test email address ${TEST_CONTACT_EMAIL} was used instead of the real one.`,
        );
        return TEST_CONTACT_EMAIL;
      };
