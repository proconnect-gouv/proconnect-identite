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
    async ({ text, req, notFound }) => {
      const { siren } = req.valid("param");
      const filepath = join(import.meta.dirname, `${siren}.json`);
      try {
        const fileContent = await readFile(filepath, "utf8");
        return text(fileContent);
      } catch (error) {
        console.error(`Error reading file for siren ${siren}:`, error);
        return notFound();
      }
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
