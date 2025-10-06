// src https://stackoverflow.com/questions/40994095/pipe-streams-to-edit-csv-file-in-node-js
import {
  isEmailValid,
  isNameValid,
  isPhoneNumberValid,
  isSiretValid,
} from "@proconnect-gouv/proconnect.core/security";
import {
  createUserFactory,
  findByEmailFactory,
  updateUserFactory,
} from "@proconnect-gouv/proconnect.identite/repositories/user";
import { AxiosError } from "axios";
import { parse, stringify, transform } from "csv";
import fs from "fs";
import { isEmpty, isString, some, toInteger } from "lodash-es";
import { z } from "zod";
import { getOrganizationInfo } from "../src/connectors/api-sirene";
import { getDatabaseConnection } from "../src/connectors/postgres";
import { findByUserId } from "../src/repositories/organization/getters";
import {
  linkUserToOrganization,
  upsert,
} from "../src/repositories/organization/setters";
import { logger } from "../src/services/log";
import {
  getNumberOfLineInFile,
  humanReadableDuration,
  isOrganizationInfo,
  startDurationMesure,
  throttleApiCall,
} from "../src/services/script-helpers";

//

const pg = getDatabaseConnection();
const findByEmail = findByEmailFactory({ pg });
const create = createUserFactory({ pg });
const update = updateUserFactory({ pg });

//

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
    delimiter: ";",
  }); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  const outputCsvStream = stringify({
    quoted_empty: false,
    quoted_string: false,
    header: true,
  });

  type InputCsvData = {
    prenom: string;
    nom: string;
    téléphone: string;
    email: string;
    coordinateur: string;
    "Code Postal": string;
    "Nom commune": string;
    "SIRET structure": string;
    "email professionnel secondaire": string;
  };
  type OutputCsvData = InputCsvData & { error: string };
  const input_file_lines = await getNumberOfLineInFile(INPUT_FILE);
  let i = 1;
  let rejected_invalid_email_address_count = 0;
  let rejected_invalid_siret_count = 0;
  let rejected_invalid_names_count = 0;
  let rejected_invalid_phone_number_count = 0;
  let rejected_invalid_org_count = 0;
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
          coordinateur,
          prenom: given_name,
          nom: family_name,
          téléphone: phone_number,
          "email professionnel secondaire": professional_email,
          "SIRET structure": siret,
        } = data;
        logger.info(`${i}: processing ${professional_email}...`);
        // 0. params validation
        if (!isString(professional_email)) {
          i++;
          rejected_invalid_email_address_count++;
          logger.error(`invalid email address ${professional_email}`);
          return done(null, {
            ...data,
            error: "rejected_invalid_email_address",
          });
        }
        const email = professional_email.toLowerCase();
        if (!isEmailValid(email)) {
          i++;
          rejected_invalid_email_address_count++;
          logger.error(`invalid email address ${email}`);
          return done(null, {
            ...data,
            error: "rejected_invalid_email_address",
          });
        }
        if (!isNameValid(given_name) || !isNameValid(family_name)) {
          i++;
          rejected_invalid_names_count++;
          logger.error(`invalid names ${given_name} ${family_name}`);
          return done(null, { ...data, error: "rejected_invalid_names" });
        }
        if (!isEmpty(phone_number) && !isPhoneNumberValid(phone_number)) {
          i++;
          rejected_invalid_phone_number_count++;
          logger.error(`invalid phone number ${phone_number}`);
          return done(null, {
            ...data,
            error: "rejected_invalid_phone_number",
          });
        }
        const job =
          coordinateur === "oui"
            ? "Coordinateur conseillers numérique"
            : "Conseiller numérique";
        if (!isSiretValid(siret)) {
          i++;
          rejected_invalid_siret_count++;
          logger.error(`invalid siret ${siret}`);
          return done(null, { ...data, error: "rejected_invalid_siret" });
        }

        // 1. add user if it does not exist
        let user = await findByEmail(email);
        if (isEmpty(user)) {
          user = await create({ email });
          await update(user.id, {
            given_name,
            family_name,
            job,
            phone_number,
          });
        }

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
              verification_type: "imported_from_coop_mediation_numerique",
            });
          }
        } catch (error) {
          logger.error(`unexpected error for siret ${siret}`);
          logger.error(
            "\x1b[31m",
            error instanceof AxiosError && !isEmpty(error.response)
              ? error.response.data
              : error,
            "\x1b[0m",
          );
          logger.error("");

          await throttleApiCall(start, maxInseeCallRateInMs);
          rejected_invalid_org_count++;
          return done(null, { ...data, error: "rejected_invalid_org" });
        }
        await throttleApiCall(start, maxInseeCallRateInMs);

        i++;
        success_count++;
        return done(null);
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
        return done(null, { ...data, error: "unexpected_error" });
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
      "rejected_invalid_org_count:             \x1b[33m",
      rejected_invalid_org_count,
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
