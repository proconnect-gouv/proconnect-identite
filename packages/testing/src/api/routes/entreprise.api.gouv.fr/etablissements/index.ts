//

import { zValidator } from "@hono/zod-validator";
import { readFile } from "fs/promises";
import { Hono } from "hono";
import { join } from "path";
import { z } from "zod";

//

export default new Hono().get(
  "/sirene/etablissements/:siret",
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
