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
      // NOTE(douglasduteil): ensure the siret is the same as the one we got
      // Protection against some staging endpoint magic
      assert.equal(content.siren, siren);

      const safeContent = anonymize(content);
      await writeFile(filename, await format(safeContent, { parser: "json" }));
      console.log("wrote", filename);

      return new Response(safeContent);
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

function anonymize(content: ReponseCompany) {
  if (!content.formality?.content?.personnePhysique) {
    return JSON.stringify(content);
  }
  const anonymizedContent: ReponseCompany = {
    ...content,
    formality: {
      ...content.formality,
      content: {
        ...content.formality.content,
        personnePhysique: {
          etablissementPrincipal:
            content.formality.content.personnePhysique.etablissementPrincipal,
        },
      },
    },
  };
  return JSON.stringify(anonymizedContent);
}
