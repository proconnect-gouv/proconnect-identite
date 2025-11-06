//

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { glob, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import z from "zod";

//

export const { TESTING_INSEE_API_SIRETS, TESTING_INSEE_API_SIRENS } = (
  await Array.fromAsync(
    await glob("*.json", {
      cwd: import.meta.dirname,
    }),
  )
)
  .map((filename) => basename(filename, ".json"))
  .reduce(
    (acc, id) => {
      if (id.length === 14) {
        acc.TESTING_INSEE_API_SIRETS.push(id);
      } else if (id.length === 9) {
        acc.TESTING_INSEE_API_SIRENS.push(id);
      }
      return acc;
    },
    {
      TESTING_INSEE_API_SIRETS: [] as string[],
      TESTING_INSEE_API_SIRENS: [] as string[],
    },
  );

export default new Hono()
  .get(
    "/api-sirene/prive/3.11/siren/:siren",
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
  .get(
    "/api-sirene/prive/3.11/siret/:siret",
    zValidator(
      "param",
      z.object({
        siret: z.string().length(14),
      }),
    ),
    async ({ text, req }) => {
      const { siret } = req.valid("param");
      return text(
        await readFile(join(import.meta.dirname, `${siret}.json`), "utf8"),
      );
    },
  );
