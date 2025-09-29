//

import { PEOPLE } from "#src/api/data/entreprise";
import { findBySiretFactory } from "@gouvfr-lasuite/proconnect.entreprise/api/insee";
import {
  createEntrepriseOpenApiClient,
  type EntrepriseOpenApiClient,
} from "@gouvfr-lasuite/proconnect.entreprise/client";
import type { InseeSireneEstablishmentSiretResponseData } from "@gouvfr-lasuite/proconnect.entreprise/types";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";
import type { CommandModule } from "yargs";
import type { EntrepriseCommandOptions } from "../options.js";

//

export const AddEstablishmentCommand: CommandModule<
  EntrepriseCommandOptions,
  EntrepriseCommandOptions & { siret: string }
> = {
  command: "add <siret>",
  describe: "Add an establishment to the file based database",
  builder: (yargs) =>
    yargs.positional("siret", { type: "string", demandOption: true }),
  handler: async (argv) => {
    const { context, recipient, token, rootDir, siret, url } = argv;
    const filename = join(
      rootDir,
      "api/routes/entreprise.api.gouv.fr/etablissements",
      `${siret}.json`,
    );
    async function intercepter(input: Request) {
      const response = await fetch(input);
      if (!response.ok) throw new Error(await response.text());
      const content = (await response.json()) as {
        data: InseeSireneEstablishmentSiretResponseData;
      };
      // NOTE(douglasduteil): ensure the siret is the same as the one we got
      // Protection against some staging endpoint magic
      assert.equal(content.data.siret, siret);

      const safeContent = anonymize(content);
      await writeFile(filename, await format(safeContent, { parser: "json" }));
      console.log("wrote", filename);

      return new Response(safeContent);
    }

    const entrepriseOpenApiClient: EntrepriseOpenApiClient =
      createEntrepriseOpenApiClient(token, {
        baseUrl: url,
        fetch: intercepter,
      });

    const findBySiret = findBySiretFactory(entrepriseOpenApiClient, {
      context,
      object: "findEstablishmentBySiret",
      recipient,
    });

    await findBySiret(siret);
  },
};

function anonymize(content: {
  data: InseeSireneEstablishmentSiretResponseData;
}) {
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
