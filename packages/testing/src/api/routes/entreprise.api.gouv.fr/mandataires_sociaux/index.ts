//

import { zValidator } from "@hono/zod-validator";
import { readFile } from "fs/promises";
import { Hono } from "hono";
import { join } from "path";
import { z } from "zod";

//

export default new Hono().get(
  "v3/infogreffe/rcs/unites_legales/:siren/mandataires_sociaux",
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
    );
  },
);
