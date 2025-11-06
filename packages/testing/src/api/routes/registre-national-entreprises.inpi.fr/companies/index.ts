//

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { glob, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import z from "zod";

//

export const TESTING_RNE_API_SIRENS = (
  await Array.fromAsync(
    await glob("*.json", {
      cwd: import.meta.dirname,
    }),
  )
).map((filename) => basename(filename, ".json"));

export default new Hono().get(
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
);
