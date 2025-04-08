//

import { createAnnuaireOpenApiClient } from "@gouvfr-lasuite/proconnect.lannuaire/client";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";
import type { CommandModule } from "yargs";
import { PEOPLE } from "../../../api/data/people.js";
import type { AnnuaireCommandOptions } from "../options.js";

//

export const AddMairieCommand: CommandModule<
  AnnuaireCommandOptions,
  AnnuaireCommandOptions & { siren: string }
> = {
  command: "add <siren>",
  describe: "Add a mairie to the file based database",
  builder: (yargs) =>
    yargs.positional("siren", { type: "string", demandOption: true }),
  handler: async (argv) => {
    const { context, recipient, token, rootDir, siren, url } = argv;
    const filename = join(
      rootDir,
      "api/routes/api-lannuaire.service-public.fr/mairies",
      `${siren}.json`,
    );
    async function intercepter(input: Request) {
      const response = await fetch(input);
      const content = await response.text();

      await writeFile(filename, await format(content, { parser: "json" }));
      console.log("wrote", filename);

      return new Response(content);
    }

    const sdf = createAnnuaireOpenApiClient();
    const zer = await sdf.GET(
      "/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records",
      { params: { query: { where: "" } } },
    );

    console.log(zer);
    // const entrepriseOpenApiClient: EntrepriseOpenApiClient =
    //   createAnnuaireOpenApiClient(token, {
    //     baseUrl: url,
    //     fetch: intercepter,
    //   });

    // const findBySiret = findBySiretFactory(entrepriseOpenApiClient);

    // const establishment = await findBySiret(siret);

    // NOTE(douglasduteil): ensure the siret is the same as the one we got
    // Protection against some staging endpoint magic
    // assert.equal(establishment.siret, siret);
  },
};

function anonymize(content: { data: InseeSiretEstablishment }) {
  if (content.data.unite_legale.status_diffusion === "diffusible") {
    return JSON.stringify(content);
  }

  if (!PEOPLE.has(content.data.siret)) {
    throw new Error(
      "🛑 One does not simply publish private data\n" +
        `${content.data.siret} is ${content.data.unite_legale.status_diffusion} and needs to be anonymized`,
    );
  }
  const peaple = PEOPLE.get(content.data.siret)!;
  content.data.adresse = peaple.adresse;
  content.data.unite_legale.personne_physique_attributs =
    peaple.personne_physique_attributs;

  return JSON.stringify(content);
}
