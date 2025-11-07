//

import { zValidator } from "@hono/zod-validator";
import type { CompaniesSirenResponse } from "@proconnect-gouv/proconnect.registre_national_entreprises/types";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { glob, readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import z from "zod";
import DiscoverPage from "./discover.page.js";

//

export const TESTING_RNE_API_SIRENS = (
  await Array.fromAsync(
    await glob("*.json", {
      cwd: import.meta.dirname,
    }),
  )
).map((filename) => basename(filename, ".json"));

export default new Hono()
  .get(
    "/api/companies/:siren",
    zValidator(
      "param",
      z.object({
        siren: z.string().length(9),
      }),
    ),
    async ({ text, req }) => {
      const { siren } = req.valid("param");
      return text(
        await readFile(join(import.meta.dirname, `${siren}.json`), "utf8"),
      );
    },
  )
  //
  .get(
    "/companies/discover",
    secureHeaders({
      contentSecurityPolicy: {
        styleSrcElem: ["'self'", "unpkg.com"],
        imgSrc: ["'self'", "data:", "avataaars.io"],
      },
    }),
    async ({ html }) => {
      const companies_siren = await Promise.all(
        (await readdir(import.meta.dirname))
          .filter((filename) => filename.endsWith(".json"))
          .toSorted((a, b) => a.localeCompare(b))
          .map(async (filename) => {
            const text = await readFile(
              join(import.meta.dirname, filename),
              "utf8",
            );
            const company: CompaniesSirenResponse = JSON.parse(text);
            return { siren: basename(filename, ".json"), company };
          }),
      );

      return html(DiscoverPage(companies_siren));
    },
  );
