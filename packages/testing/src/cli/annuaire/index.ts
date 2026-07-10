//

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";
import type { Argv, CommandModule } from "yargs";

//

export interface AnnuaireCommandOptions {
  url: string;
  rootDir: string;
}

export function AnnuaireCommandFactory({
  ANNUAIRE_SERVICE_PUBLIC_API_URL,
}: Record<string, string>): CommandModule<unknown, AnnuaireCommandOptions> {
  return {
    command: "annuaire",
    describe: "",
    builder: (yargs: Argv) =>
      yargs
        .options({
          rootDir: {
            type: "string",
            default: join(import.meta.dirname, "../../../src"),
          },
          url: { type: "string", default: ANNUAIRE_SERVICE_PUBLIC_API_URL },
        })
        .command([AddMairiesCommand])
        .demandCommand(),
    handler() {},
  };
}

//

const AddMairiesCommand: CommandModule<
  AnnuaireCommandOptions,
  AnnuaireCommandOptions & { code_insee: string }
> = {
  command: "add <code_insee>",
  describe: "Add the mairies of a commune to the file based database",
  builder: (yargs) =>
    yargs.positional("code_insee", { type: "string", demandOption: true }),
  handler: async ({ code_insee, rootDir, url }) => {
    const filename = join(
      rootDir,
      "api/routes/api-lannuaire.service-public.fr/records",
      `${code_insee}.json`,
    );

    const where = `code_insee_commune LIKE "${code_insee}" and pivot LIKE "mairie"`;
    const response = await fetch(
      `${url}/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=${encodeURIComponent(where)}`,
      { headers: { accept: "application/json" } },
    );
    if (!response.ok) throw new Error(await response.text());
    const content = (await response.json()) as { total_count: number };
    if (content.total_count === 0) {
      throw new Error(`No mairie found for code insee ${code_insee}`);
    }

    await writeFile(
      filename,
      await format(JSON.stringify(content), { parser: "json" }),
    );
    console.log("wrote", filename);
  },
};
