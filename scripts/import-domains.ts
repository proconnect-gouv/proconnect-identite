// src https://stackoverflow.com/questions/40994095/pipe-streams-to-edit-csv-file-in-node-js
import {
  isDomainValid,
  isSiretValid,
} from "@proconnect-gouv/proconnect.core/security";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";
import { AxiosError } from "axios";
import { parse, stringify, transform } from "csv";
import fs from "fs";
import { isEmpty, some, toInteger } from "lodash-es";
import { z } from "zod";
import { getOrganizationInfo } from "../src/connectors/api-sirene";
import {
  addDomain,
  findEmailDomainsByOrganizationId,
} from "../src/repositories/email-domain";
import { upsert } from "../src/repositories/organization/setters";
import { isAFreeEmailProvider } from "../src/services/email";
import { logger } from "../src/services/log";
import {
  getNumberOfLineInFile,
  humanReadableDuration,
  isOrganizationInfo,
  startDurationMesure,
  throttleApiCall,
} from "../src/services/script-helpers";

const { INPUT_FILE, OUTPUT_FILE } = z
  .object({
    INPUT_FILE: z.string().default("./input.csv"),
    OUTPUT_FILE: z.string().default("./output.csv"),
  })
  .parse(process.env);

// ex: for public insee subscription the script can be run like so:
// npm run update-organization-info 2000
const rateInMsFromArgs = toInteger(process.argv[2]);
// we wait 125ms max which allow us to make 8 requests to insee api per seconds
// this makes 480 request per minute which is just under our 500 requests per minute quota
// for 30 000 organizations, this script will run for about 1 hour
const maxInseeCallRateInMs = rateInMsFromArgs !== 0 ? rateInMsFromArgs : 125;

(async () => {
  const readStream = fs.createReadStream(INPUT_FILE); // readStream is a read-only stream wit raw text content of the CSV file
  const writeStream = fs.createWriteStream(OUTPUT_FILE); // writeStream is a write-only stream to write on the disk

  const inputCsvStream = parse({ columns: true, trim: true, cast: false }); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  const outputCsvStream = stringify({
    quoted_empty: false,
    quoted_string: false,
    header: true,
  });

  type InputCsvData = { domain: string; sirets: string };
  type OutputCsvData = { domain: string; sirets: string; result: string };
  const input_file_lines = await getNumberOfLineInFile(INPUT_FILE);
  let i = 1;
  let rejected_invalid_domain_count = 0;
  let rejected_invalid_siret_count = 0;
  let rejected_free_email_domain_count = 0;
  let rejected_empty_org_count = 0;
  let rejected_inactive_org_count = 0;
  let unexpected_error_count = 0;
  let already_known_by_mcp_count = 0;
  let success_count = 0;

  // 100ms is the benchmarked response time from INSEE API
  const estimatedExecutionTimeInMilliseconds =
    Math.max(maxInseeCallRateInMs, 100) * input_file_lines;

  logger.info("");
  logger.info(
    "\x1b[33m",
    `Estimated execution time is ${humanReadableDuration(
      estimatedExecutionTimeInMilliseconds,
    )}`,
    "\x1b[0m",
  );
  logger.info("");

  const transformStream = transform(
    { parallel: 1 }, // avoid messing with line orders
    async function (
      data: InputCsvData,
      done: (err: null | Error, data: OutputCsvData) => void,
    ) {
      try {
        const rawSirets = data.sirets;
        const rawDomain = data.domain;
        logger.info(`${i}: processing ${rawSirets} <> ${rawDomain}...`);
        const sirets: string[] = rawSirets
          .split(" ")
          .filter((s: string) => !!s)
          .map((s: string) => s.replace(/\s/g, ""));

        if (isEmpty(sirets)) {
          return done(null, { ...data, result: "ignored" });
        }

        let rowResults: string[] = [];

        for (let siret of sirets) {
          // 0. checks email provider
          const domain = rawDomain.toString().trim().toLowerCase();
          if (!isDomainValid(rawDomain)) {
            i++;
            rejected_invalid_domain_count++;
            rowResults.push("rejected_invalid_domain");
            continue;
          }
          if (isAFreeEmailProvider(domain)) {
            i++;
            rejected_free_email_domain_count++;
            rowResults.push("rejected_free_email_domain");
            continue;
          }

          // 1. check siret
          if (!isSiretValid(siret)) {
            i++;
            rejected_invalid_siret_count++;
            rowResults.push("rejected_invalid_siret");
            continue;
          }

          const start = startDurationMesure();
          try {
            // 2. get organizationInfo
            const organizationInfo = await getOrganizationInfo(siret);
            await throttleApiCall(start, maxInseeCallRateInMs);

            // 3. check organization status
            if (!isOrganizationInfo(organizationInfo)) {
              i++;
              rejected_empty_org_count++;
              rowResults.push("rejected_empty_org");
              continue;
            }

            if (!organizationInfo.estActive) {
              i++;
              rejected_inactive_org_count++;
              rowResults.push("rejected_inactive_org");
              continue;
            }

            // 3. update organizationInfo
            const organization: Organization = await upsert({
              siret: organizationInfo.siret,
              organizationInfo,
            });

            // 4. add domain
            const emailDomains = await findEmailDomainsByOrganizationId(
              organization.id,
            );

            // if the domain is already register, whatever the status, we do not insert it
            if (!some(emailDomains, { domain })) {
              i++;
              already_known_by_mcp_count++;
              rowResults.push("already_known_by_mcp");
              continue;
            }

            await addDomain({
              organization_id: organization.id,
              domain,
              verification_type: null,
            });
            i++;
            success_count++;
            rowResults.push("success");
          } catch (error) {
            if (error instanceof NotFoundError) {
              i++;
              rejected_invalid_siret_count++;
              rowResults.push("rejected_invalid_siret");
              continue;
            }

            logger.info(
              "\x1b[31m",
              error instanceof AxiosError && !isEmpty(error.response)
                ? error.response.data
                : error,
              "\x1b[0m",
            );
            logger.info("");
            logger.error(`unexpected error for siret: ${siret}`);
            logger.error(error);

            await throttleApiCall(start, maxInseeCallRateInMs);
            i++;
            unexpected_error_count++;
            rowResults.push("unexpected_error");
          }
        }
        return done(null, { ...data, result: rowResults.join(" ") });
      } catch (error) {
        return done(null, { ...data, result: "unexpected_error" });
      }
    },
  ).on("end", () => {
    logger.info(`Import done! Import logs are recorded in ${OUTPUT_FILE}.`);
    logger.info("");
    logger.info(
      "success_count:                          \x1b[32m",
      success_count,
      "\x1b[0m",
    );
    logger.info(
      "already_known_by_mcp_count:             \x1b[32m",
      already_known_by_mcp_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_invalid_domain_count:          \x1b[33m",
      rejected_invalid_domain_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_free_email_domain_count:       \x1b[33m",
      rejected_free_email_domain_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_invalid_siret_count:           \x1b[33m",
      rejected_invalid_siret_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_inactive_org_count:            \x1b[33m",
      rejected_inactive_org_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_empty_org_count:               \x1b[33m",
      rejected_empty_org_count,
      "\x1b[0m",
    );
    logger.info(
      "unexpected_error_count:                 \x1b[31m",
      unexpected_error_count,
      "\x1b[0m",
    );
    logger.info(
      "total:                                  \x1b[1m",
      i - 1,
      "\x1b[21m",
    );
  });

  logger.info(`Importing data from ${INPUT_FILE}`);

  readStream
    .pipe(inputCsvStream)
    .pipe(transformStream)
    .pipe(outputCsvStream)
    .pipe(writeStream);
})();
