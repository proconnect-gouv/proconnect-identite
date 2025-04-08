//
//

import { join } from "node:path";
import type { Argv, CommandModule } from "yargs";
import { AddMairieCommand } from "./mairies/index.js";
import type { AnnuaireCommandOptions } from "./options.js";

//

export function AnnuaireCommandFactory({}: Record<
  string,
  string
>): CommandModule<unknown, AnnuaireCommandOptions> {
  return {
    command: "annuaire",
    describe: "",
    builder: (yargs: Argv) =>
      yargs
        .options({
          rootDir: {
            type: "string",
            default: join(import.meta.dirname, "../.."),
          },
          url: {
            type: "string",
            default: "https://api-lannuaire.service-public.fr",
          },
        })
        .command([AddMairieCommand])
        .demandCommand(),
    handler() {},
  };
}
