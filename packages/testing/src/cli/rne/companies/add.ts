//

import {
  createRegistreNationalEntreprisesClient,
  getRegistreNationalEntreprisesAccessTokenFactory,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import {
  createRegistreNationalEntreprisesOpenApiClient,
  type RegistreNationalEntreprisesOpenApiClient,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/client";
import type { ReponseCompany } from "@proconnect-gouv/proconnect.registre_national_entreprises/types";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";
import type { CommandModule } from "yargs";
import type { RneCommandOptions } from "../options.js";

//

export const AddCompanyCommand: CommandModule<
  RneCommandOptions,
  RneCommandOptions & { siren: string }
> = {
  command: "add <siren>",
  describe: "Add a company to the file based database",
  builder: (yargs) =>
    yargs.positional("siren", { type: "string", demandOption: true }),
  handler: async (argv) => {
    const { username, password, rootDir, siren, apiBaseUrl } = argv;
    const filename = join(
      rootDir,
      "api/routes/registre-national-entreprises.inpi.fr/companies",
      `${siren}.json`,
    );
    async function intercepter(input: Request) {
      const response = await fetch(input);
      if (!response.ok) throw new Error(await response.text());
      const content = (await response.json()) as ReponseCompany;
      // NOTE(douglasduteil): ensure the siren is the same as the one we got
      // Protection against some staging endpoint magic
      assert.equal(content.siren, siren);
      const reducedContent = reduceContent(content);
      await writeReducedContentOnDisk(reducedContent, filename);

      return new Response(reducedContent);
    }

    const rneOpenApiClient: RegistreNationalEntreprisesOpenApiClient =
      createRegistreNationalEntreprisesOpenApiClient({
        fetch: intercepter,
        baseUrl: apiBaseUrl,
      });
    const rneClient = createRegistreNationalEntreprisesClient(
      rneOpenApiClient,
      getRegistreNationalEntreprisesAccessTokenFactory({
        username,
        password,
      }),
    );

    await rneClient.findCompanyBySiren(siren);
  },
};

async function writeReducedContentOnDisk(
  reducedContent: string,
  filename: string,
) {
  await writeFile(filename, await format(reducedContent, { parser: "json" }));
  return reducedContent;
}

function reduceContent(content: ReponseCompany) {
  const reducedContent = {
    formality: {
      content: {
        personnePhysique: content.formality?.content?.personnePhysique
          ? {
              etablissementPrincipal: {
                descriptionEtablissement:
                  content.formality?.content?.personnePhysique
                    ?.etablissementPrincipal?.descriptionEtablissement,
              },
            }
          : undefined,
      },
    },
  };
  return JSON.stringify(reducedContent);
}
