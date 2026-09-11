//

import { AnnuaireCommandFactory } from "@proconnect-gouv/proconnect.testing/cli/annuaire";
import { EntrepriseCommandFactory } from "@proconnect-gouv/proconnect.testing/cli/entreprise";
import { RneCommandFactory } from "@proconnect-gouv/proconnect.testing/cli/rne";
import yargs from "yargs";
import {
  ANNUAIRE_SERVICE_PUBLIC_API_URL,
  ENTREPRISE_API_TOKEN,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
  ENTREPRISE_API_URL,
  RNE_API_BASE_URL,
  RNE_API_PASSWORD,
  RNE_API_USERNAME,
} from "../src/config/env";

//

yargs(process.argv.slice(2))
  .command(
    AnnuaireCommandFactory({
      ANNUAIRE_SERVICE_PUBLIC_API_URL,
    }),
  )
  .command(
    EntrepriseCommandFactory({
      ENTREPRISE_API_TOKEN,
      ENTREPRISE_API_TRACKING_CONTEXT,
      ENTREPRISE_API_TRACKING_RECIPIENT,
      ENTREPRISE_API_URL,
    }),
  )
  .command(
    RneCommandFactory({
      RNE_API_USERNAME,
      RNE_API_PASSWORD,
      RNE_API_BASE_URL,
    }),
  )
  .demandCommand()
  .help()
  .wrap(72)
  .parse();
