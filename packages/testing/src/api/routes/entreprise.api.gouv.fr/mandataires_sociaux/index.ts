//

import type { InfogreffeSirenMandatairesSociaux } from "@gouvfr-lasuite/proconnect.entreprise/types";
import { zValidator } from "@hono/zod-validator";
import { readdir, readFile } from "fs/promises";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { basename, join } from "path";
import { z } from "zod";
import errorHandler from "./_error.js";
import DiscoverPage from "./discover.page.js";

//

export default new Hono()
  .onError(errorHandler)
  .get(
    "/v3/infogreffe/rcs/unites_legales/:siren/mandataires_sociaux",
    zValidator(
      "param",
      z.object({
        siren: z.string(),
      }),
    ),
    async ({ text, req }) => {
      const { siren } = req.valid("param");
      return text(
        await readFile(join(import.meta.dirname, `${siren}.json`), "utf8"),
        200,
        {
          "Content-Type": "application/json",
        },
      );
    },
  )
  //
  .get(
    "/mandataires_sociaux/discover",
    secureHeaders({
      contentSecurityPolicy: {
        styleSrcElem: ["'self'", "unpkg.com"],
        imgSrc: ["'self'", "data:", "avataaars.io"],
      },
    }),
    async ({ html }) => {
      const siren_pair = await Promise.all(
        (await readdir(import.meta.dirname))
          .filter((filename) => filename.endsWith(".json"))
          .toSorted((a, b) => a.localeCompare(b))
          .map(async (filename) => {
            const text = await readFile(
              join(import.meta.dirname, filename),
              "utf8",
            );
            const response: InfogreffeSirenMandatairesSociaux[] = JSON.parse(
              text,
            ).data.map(({ data }: any) => data);
            return { siren: basename(filename), mandataires: response };
          }),
      );

      return html(DiscoverPage(siren_pair));
    },
  );
