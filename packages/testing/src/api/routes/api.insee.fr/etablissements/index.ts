//

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import z from "zod";

//

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
