//

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

//

export const TestingAnnuaireServicePublicRouter = new Hono().get(
  "/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records",
  zValidator("query", z.object({ where: z.string() })),
  async ({ json, req }) => {
    const { where } = req.valid("query");
    const [, code_insee] = where.match(/code_insee_commune LIKE "(\w+)"/) ?? [];

    const records = await readFile(
      join(import.meta.dirname, "records", `${code_insee}.json`),
      "utf8",
    ).catch(() => null);
    if (!records) return json({ total_count: 0, results: [] });

    return json(JSON.parse(records));
  },
);
