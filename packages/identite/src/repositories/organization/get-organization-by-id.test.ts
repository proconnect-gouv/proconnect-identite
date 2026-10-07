//

import { emptyDatabase, migrate, pg } from "#testing";
import { OrganizationNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { getOrganizationByIdFactory } from "./get-organization-by-id.js";

//

const getOrganizationById = getOrganizationByIdFactory({ pg: pg as any });

suite("getOrganizationByIdFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should throw OrganizationNotFoundError when not found", async () => {
    await assert.rejects(
      () => getOrganizationById(1),
      (err: unknown) => err instanceof OrganizationNotFoundError,
    );
  });

  test("should return the organization when it exists", async () => {
    await pg.sql`
      INSERT INTO organizations
        (cached_libelle, cached_nom_complet, id, siret, created_at, updated_at)
      VALUES
        ('Necron', 'Necrontyr', 1, '⚰️', '1967-12-19', '1967-12-19')
      ;
    `;

    const Organization = await getOrganizationById(1);

    assert.equal(Organization.id, 1);
  });
});
