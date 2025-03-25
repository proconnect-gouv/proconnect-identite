//
//

import { join } from "node:path";
import type { Argv, CommandModule } from "yargs";
import { AddEstablishmentCommand } from "./etablissements/index.js";
import type { EntrepriseCommandOptions } from "./options.js";

//

export function EntrepriseCommandFactory({
  ENTREPRISE_API_TOKEN,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
  ENTREPRISE_API_URL,
}: Record<string, string>): CommandModule<unknown, EntrepriseCommandOptions> {
  return {
    command: "entreprise",
    describe: "",
    builder: (yargs: Argv) =>
      yargs
        .options({
          token: { type: "string", default: ENTREPRISE_API_TOKEN },
          context: { type: "string", default: ENTREPRISE_API_TRACKING_CONTEXT },
          recipient: {
            type: "string",
            default: ENTREPRISE_API_TRACKING_RECIPIENT,
          },
          rootDir: {
            type: "string",
            default: join(import.meta.dirname, "../.."),
          },
          url: { type: "string", default: ENTREPRISE_API_URL },
        })
        .command([AddEstablishmentCommand])
        .demandCommand(),
    handler() {},
  };
}
