//

import { zValidator } from "@hono/zod-validator";
import type { InseeSireneEstablishmentSiretResponseData } from "@proconnect-gouv/proconnect.entreprise/types";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { glob, readdir, readFile } from "node:fs/promises";
import { basename, join } from "path";
import { z } from "zod";
import DiscoverPage from "./discover.page.js";

//

export const TESTING_ENTREPRISE_API_SIRETS = (
  await Array.fromAsync(
    await glob("*.json", {
      cwd: import.meta.dirname,
    }),
  )
).map((filename) => basename(filename, ".json"));

//

export default new Hono()
  .get(
    "/v3/insee/sirene/etablissements/:siret",
    zValidator(
      "param",
      z.object({
        siret: z.string(),
      }),
    ),
    async ({ text, req }) => {
      const { siret } = req.valid("param");
      return text(
        await readFile(join(import.meta.dirname, `${siret}.json`), "utf8"),
      );
    },
  )
  //
  .get(
    "/etablissements/discover",
    secureHeaders({
      contentSecurityPolicy: {
        styleSrcElem: ["'self'", "unpkg.com"],
        imgSrc: ["'self'", "data:", "avataaars.io"],
      },
    }),
    async ({ html }) => {
      const establishment_siret_pair = await Promise.all(
        (await readdir(import.meta.dirname))
          .filter((filename) => filename.endsWith(".json"))
          .toSorted((a, b) => a.localeCompare(b))
          .map(async (filename) => {
            const text = await readFile(
              join(import.meta.dirname, filename),
              "utf8",
            );
            const response: {
              data: InseeSireneEstablishmentSiretResponseData;
            } = JSON.parse(text);
            return { establishment: response.data, siren: basename(filename) };
          }),
      );
      return html(DiscoverPage(establishment_siret_pair));
    },
  );
