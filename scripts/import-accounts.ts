// src https://stackoverflow.com/questions/40994095/pipe-streams-to-edit-csv-file-in-node-js
import {
  isEmailValid,
  isNameValid,
  isSiretValid,
} from "@proconnect-gouv/proconnect.core/security";
import { LinkTypes } from "@proconnect-gouv/proconnect.identite/types";
import { AxiosError } from "axios";
import { parse, stringify, transform } from "csv";
import fs from "fs";
import { isEmpty, isString, some, toInteger } from "lodash-es";
import { z } from "zod";
import { getOrganizationInfo } from "../src/connectors/api-sirene";
import { findByUserId } from "../src/repositories/organization/getters";
import {
  linkUserToOrganization,
  upsert,
} from "../src/repositories/organization/setters";
import { create, findByEmail, update } from "../src/repositories/user";
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

  const inputCsvStream = parse({
    columns: true,
    trim: true,
    cast: false,
    delimiter: ",",
  }); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  const outputCsvStream = stringify({
    quoted_empty: false,
    quoted_string: false,
    header: true,
  });

  type InputCsvData = {
    last_name: string;
    first_name: string;
    email: string;
    sub: string;
    siret: string;
  };
  type OutputCsvData = {
    email: string;
    inclusionconnect_sub: string;
    moncomptepro_sub: string;
  };
  const input_file_lines = await getNumberOfLineInFile(INPUT_FILE);
  let i = 1;
  let rejected_invalid_email_address_count = 0;
  let rejected_invalid_siret_count = 0;
  let rejected_invalid_names_count = 0;
  let rejected_invalid_sub_count = 0;
  let unexpected_error_count = 0;
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
      done: (err: null | Error, data?: OutputCsvData) => void,
    ) {
      const start = startDurationMesure();
      try {
        const {
          first_name,
          last_name,
          sub,
          email: rawEmail,
          siret: rawSirets,
        } = data;
        logger.info(`${i}: processing ${rawEmail}...`);
        // 0. params validation
        if (!isString(rawEmail)) {
          i++;
          rejected_invalid_email_address_count++;
          logger.error(`invalid email address ${rawEmail}`);
          return done(null);
        }
        const email = rawEmail.toLowerCase();
        if (!isEmailValid(email)) {
          i++;
          rejected_invalid_email_address_count++;
          logger.error(`invalid email address ${email}`);
          return done(null);
        }
        if (!isNameValid(first_name) || !isNameValid(last_name)) {
          i++;
          rejected_invalid_names_count++;
          logger.error(`invalid name ${first_name} ${last_name}`);
          return done(null);
        }
        if (isEmpty(sub)) {
          i++;
          rejected_invalid_sub_count++;
          logger.error(`invalid sub ${sub}`);
          return done(null);
        }

        // 1. add user if it does not exist
        let user = await findByEmail(email);
        if (isEmpty(user)) {
          user = await create({ email });
          await update(user.id, {
            given_name: first_name,
            family_name: last_name,
            needs_inclusionconnect_welcome_page: true,
            needs_inclusionconnect_onboarding_help: true,
          });
        }

        const sirets: string[] = rawSirets
          .split(" ")
          .filter((s: string) => !!s)
          .map((s: string) => s.trim());
        if (sirets.length > 0 && sirets.some((s) => !isSiretValid(s))) {
          i++;
          rejected_invalid_siret_count++;
          logger.error(`invalid siret ${rawSirets}`);
          return done(null);
        }

        for (let siret of sirets) {
          // 2. get organizationInfo
          try {
            const organizationInfo = await getOrganizationInfo(siret);
            if (!isOrganizationInfo(organizationInfo)) {
              throw Error("empty organization info");
            }
            if (!organizationInfo.estActive) {
              throw Error("organization not active");
            }

            // 3. update organizationInfo
            const organization = await upsert({
              siret: organizationInfo.siret,
              organizationInfo,
            });

            // 4. create the user-organization link
            const usersOrganizations = await findByUserId(user.id);
            if (!some(usersOrganizations, ["id", organization.id])) {
              await linkUserToOrganization({
                organization_id: organization.id,
                user_id: user.id,
                verification_type:
                  LinkTypes.enum.imported_from_inclusion_connect,
              });
            }
          } catch (error) {
            logger.error(`unexpected error for siret: ${siret}`);
            logger.error(error);
          }
          await throttleApiCall(start, maxInseeCallRateInMs);
        }
        i++;
        success_count++;
        return done(null, {
          email,
          inclusionconnect_sub: sub,
          moncomptepro_sub: String(user.id),
        });
      } catch (error) {
        logger.error("unexpected error");
        logger.error(
          "\x1b[31m",
          error instanceof AxiosError && !isEmpty(error.response)
            ? error.response.data
            : error,
          "\x1b[0m",
        );
        logger.error("");

        await throttleApiCall(start, maxInseeCallRateInMs);
        i++;
        unexpected_error_count++;
        return done(null);
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
      "rejected_invalid_email_address_count:   \x1b[33m",
      rejected_invalid_email_address_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_invalid_siret_count:           \x1b[33m",
      rejected_invalid_siret_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_invalid_names_count:           \x1b[33m",
      rejected_invalid_names_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_invalid_sub_count:             \x1b[33m",
      rejected_invalid_sub_count,
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
