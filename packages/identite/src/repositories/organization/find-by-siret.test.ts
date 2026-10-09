//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findBySiretFactory } from "./find-by-siret.js";

//

const findBySiret = findBySiretFactory({ pg: pg as any });

suite("findBySiretFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should find the organization by siret", async () => {
    await pg.sql`
      INSERT INTO organizations
        (cached_libelle, cached_nom_complet, id, siret, created_at, updated_at)
      VALUES
        ('Necron', 'Necrontyr', 1, '⚰️', '1967-12-19', '1967-12-19')
      ;
    `;

    const organization = await findBySiret("⚰️");

    assert.equal(organization?.id, 1);
  });

  test("should return undefined when siret does not exist", async () => {
    const organization = await findBySiret("absent");

    assert.equal(organization, undefined);
  });
});
