//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findByClientIdFactory } from "./find-by-client-id.js";

//

const findByClientId = findByClientIdFactory({ pg: pg as any });

suite("findByClientIdFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return undefined when the client does not exist", async () => {
    const client = await findByClientId("absent");

    assert.equal(client, undefined);
  });

  test("should return the client when it exists", async () => {
    await pg.sql`
      INSERT INTO oidc_clients
        (client_id, client_name, client_secret, created_at, updated_at)
      VALUES
        ('⚔️', 'Dark Angels', 'secret', '4444-04-04', '4444-04-04')
      ;
    `;

    const client = await findByClientId("⚔️");

    assert.equal(client?.client_name, "Dark Angels");
  });
});
