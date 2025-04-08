//

import yargs from "yargs";
import { AnnuaireCommandFactory } from "../packages/testing/src/cli/annuaire";
import { EntrepriseCommandFactory } from "../packages/testing/src/cli/entreprise";
import {
  ENTREPRISE_API_TOKEN,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
  ENTREPRISE_API_URL,
} from "../src/config/env";

//

yargs(process.argv.slice(2))
  .command(AnnuaireCommandFactory({}))
  .command(
    EntrepriseCommandFactory({
      ENTREPRISE_API_TOKEN,
      ENTREPRISE_API_TRACKING_CONTEXT,
      ENTREPRISE_API_TRACKING_RECIPIENT,
      ENTREPRISE_API_URL,
    }),
  )
  .demandCommand()
  .help()
  .wrap(72)
  .parse();
