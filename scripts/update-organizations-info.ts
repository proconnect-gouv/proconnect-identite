//

import { findBySiretFactory } from "@proconnect-gouv/proconnect.api_entreprise/api/insee";
import { getOrganizationInfoFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { AxiosError } from "axios";
import { isDate, isEmpty, toInteger } from "lodash-es";
import type { Pool } from "pg";
import { apiEntrepriseOpenApiTestClient } from "../src/connectors/api-entreprise";
import { getDatabaseConnection } from "../src/connectors/postgres";
import { upsert } from "../src/repositories/organization/setters";
import { logger } from "../src/services/log";
import {
  getDurationInMilliseconds,
  humanReadableDuration,
  isOrganizationInfo,
} from "../src/services/script-helpers";

//

const findBySiret = findBySiretFactory(apiEntrepriseOpenApiTestClient, {
  context: "🎭 Organization info script 🎭",
  object: "findEstablishmentBySiret",
  recipient: "13002526500013",
});

export const getOrganizationInfo = getOrganizationInfoFactory({
  findBySiren: () => Promise.reject(new Error("💣")),
  findBySiret,
});

// ex: for public insee subscription the script can be run like so:
// npm run update-organization-info 2000
const rateInMsFromArgs = toInteger(process.argv[2]);
const maxInseeCallRateInMs = rateInMsFromArgs !== 0 ? rateInMsFromArgs : 250;

(async () => {
  logger.info("Start updating organization info...");
  let connection: Pool;
  let i = 0;

  try {
    connection = getDatabaseConnection();

    // 0. estimate execution time
    const {
      rows: [{ count }],
    } = await connection.query(
      `
    SELECT COUNT(*) FROM organizations WHERE organization_info_fetched_at IS NULL`,
      [],
    );

    // 50ms is an estimated additional delay from insee API
    const estimatedExecutionTimeInMilliseconds =
      Math.max(maxInseeCallRateInMs, 320) * toInteger(count);
    logger.info("");
    logger.info(
      "\x1b[33m",
      `Estimated execution time is ${humanReadableDuration(
        estimatedExecutionTimeInMilliseconds,
      )}`,
      "\x1b[0m",
    );
    logger.info("");

    while (true) {
      const start = process.hrtime();

      // 1. get an organization
      const { rows: results } = await connection.query(
        `
          SELECT id, siret, organization_info_fetched_at
          FROM organizations
          ORDER BY id LIMIT 1 OFFSET $1`,
        [i],
      );
      if (isEmpty(results)) {
        break;
      }
      const [{ id, siret, organization_info_fetched_at }] = results;

      if (isDate(organization_info_fetched_at)) {
        i++;
        continue;
      }

      // 2. fetch organization info
      logger.info(`${i}: fetching info for ${siret} (id: ${id})...`);
      let organizationInfo: any = {};
      try {
        organizationInfo = await getOrganizationInfo(siret);
        if (!isOrganizationInfo(organizationInfo)) {
          throw new Error("not found");
        }

        if (organizationInfo.siret !== siret) {
          throw new Error("invalid response from sirene API");
        }
      } catch (error) {
        logger.info(
          "\x1b[31m",
          `Error while fetching data for: ${siret}`,
          "\x1b[0m",
        );
        logger.error(`Error while fetching data for: ${siret}`);
        logger.error(
          error instanceof AxiosError && !isEmpty(error.response)
            ? error.response.data
            : error,
        );
        logger.error("");
      }

      // 3. update the organization
      if (isOrganizationInfo(organizationInfo)) {
        logger.info(`libelle: ${organizationInfo.libelle}`);
        await upsert({ siret, organizationInfo });
      }

      // 4. throttle the update
      const durationInMilliseconds = getDurationInMilliseconds(start);
      // we wait 250ms max which allow us to make 4 requests to insee api per seconds
      // this makes 240 request per minute which is the half of our 500 requests per minute quota
      // for 30 000 organizations, this script will run for about 2 hours
      const waitTimeInMilliseconds = Math.max(
        maxInseeCallRateInMs - durationInMilliseconds,
        0,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, waitTimeInMilliseconds),
      );

      // 5. increment index
      i++;
    }

    await connection.end();
    logger.info("");
    logger.info("\x1b[32m", "Update completed!", "\x1b[0m");
  } catch (e) {
    await connection!.end();
    logger.info("");
    logger.info("\x1b[31m", "Update aborted!", "\x1b[0m");
    logger.error(`Unexpected error! The update was interrupted at index ${i}.`);
    logger.error(e);
    process.exit(1);
  }
})();
