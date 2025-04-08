//

import { zValidator } from "@hono/zod-validator";
import { readFile } from "fs/promises";
import { Hono } from "hono";
import { join } from "path";
import { z } from "zod";

//

export default new Hono().get(
  "/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records",
  zValidator(
    "query",
    z.object({
      where: z.string(),
    }),
  ),
  async ({ text, req }) => {
    // const { where } = req.valid("param");
    // code_insee_commune LIKE "${codeOfficielGeographique}" and pivot LIKE "mairie"
    const siren = "lol";
    return text(
      await readFile(join(import.meta.dirname, `${siren}.json`), "utf8"),
    );
  },
);
