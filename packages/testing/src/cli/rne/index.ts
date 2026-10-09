import { join } from "node:path";
import type { Argv, CommandModule } from "yargs";
import { AddCompanyCommand } from "./companies/index.js";
import type { RneCommandOptions } from "./options.js";

//

export function RneCommandFactory({
  RNE_API_USERNAME,
  RNE_API_PASSWORD,
  RNE_API_BASE_URL,
}: Record<string, string>): CommandModule<unknown, RneCommandOptions> {
  return {
    command: "rne",
    describe: "",
    builder: (yargs: Argv) =>
      yargs
        .options({
          username: { type: "string", default: RNE_API_USERNAME },
          password: { type: "string", default: RNE_API_PASSWORD },
          rootDir: {
            type: "string",
            default: join(import.meta.dirname, "../../../src"),
          },
          apiBaseUrl: { type: "string", default: RNE_API_BASE_URL },
        })
        .command([AddCompanyCommand])
        .demandCommand(),
    handler() {},
  };
}
