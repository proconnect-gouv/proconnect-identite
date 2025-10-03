//

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { glob, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import z from "zod";

//

export const TESTING_INSEE_API_SIRETS = (
  await Array.fromAsync(
    await glob("*.json", {
      cwd: import.meta.dirname,
    }),
  )
).map((filename) => basename(filename, ".json"));

export default new Hono().get(
  "/api-sirene/prive/3.11/siret/:siret",
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
);
