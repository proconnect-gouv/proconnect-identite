//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { addConnectionFactory } from "./add-connection.js";

//

const addConnection = addConnectionFactory({ pg: pg as any });

suite("addConnectionFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should insert and return the connection", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO oidc_clients
        (id, client_id, client_name, client_secret, created_at, updated_at)
      VALUES
        (1, '⚔️', 'Dark Angels', 'secret', '4444-04-04', '4444-04-04')
      ;
    `;

    const connection = await addConnection({
      user_id: 1,
      oidc_client_id: 1,
      organization_id: null,
      sp_name: "proconnect",
      user_ip_address: "127.0.0.1",
    });

    assert.equal(connection.user_id, 1);
    assert.equal(connection.oidc_client_id, 1);
  });
});
