//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { updateAuthorizationRequestLastHaltFactory } from "./update-authorization-request-last-halt.js";

//

const updateAuthorizationRequestLastHalt =
  updateAuthorizationRequestLastHaltFactory({
    pg: pg as any,
  });

suite("updateAuthorizationRequestLastHaltFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);
  beforeEach(async () => {
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
    await pg.sql`
      INSERT INTO users_oidc_clients
        (user_id, oidc_client_id, created_at, updated_at, interaction_cid)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', 'caliban'),
        (1, 1, '4444-04-04', '4444-04-04', 'fallen'),
        (1, 1, '4444-04-04', '4444-04-04', NULL)
      ;
    `;
  });

  test("should set the last halt of the authorization request of the interaction", async () => {
    await updateAuthorizationRequestLastHalt({
      interaction_cid: "caliban",
      last_halt: "franceconnect",
    });

    const { rows } = await pg.query(
      "SELECT interaction_cid, last_halt FROM users_oidc_clients ORDER BY id",
    );
    assert.deepEqual(rows, [
      { interaction_cid: "caliban", last_halt: "franceconnect" },
      { interaction_cid: "fallen", last_halt: null },
      { interaction_cid: null, last_halt: null },
    ]);
  });

  test("should do nothing without an authorization request for the interaction", async () => {
    await updateAuthorizationRequestLastHalt({
      interaction_cid: "cypher",
      last_halt: "franceconnect",
    });

    const { rows } = await pg.query(
      "SELECT interaction_cid, last_halt FROM users_oidc_clients ORDER BY id",
    );
    assert.deepEqual(rows, [
      { interaction_cid: "caliban", last_halt: null },
      { interaction_cid: "fallen", last_halt: null },
      { interaction_cid: null, last_halt: null },
    ]);
  });
});
