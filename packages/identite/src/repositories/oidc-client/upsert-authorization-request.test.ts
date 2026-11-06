//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { upsertAuthorizationRequestFactory } from "./upsert-authorization-request.js";

//

const upsertAuthorizationRequest = upsertAuthorizationRequestFactory({
  pg: pg as any,
});

suite("upsertAuthorizationRequestFactory", () => {
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
  });

  test("should insert and return the authorization request", async () => {
    const authorizationRequest = await upsertAuthorizationRequest({
      user_id: 1,
      oidc_client_id: 1,
      organization_id: null,
      sp_name: "proconnect",
      user_ip_address: "127.0.0.1",
      interaction_cid: "Rex5_Tq4tBqqwz0xPTJyd",
      outcome: "succeeded",
      sid: "ulthwe",
    });

    assert.equal(authorizationRequest.user_id, 1);
    assert.equal(authorizationRequest.oidc_client_id, 1);
    assert.equal(authorizationRequest.interaction_cid, "Rex5_Tq4tBqqwz0xPTJyd");
    assert.equal(authorizationRequest.outcome, "succeeded");
    assert.equal(authorizationRequest.sid, "ulthwe");
  });

  test("should update the authorization request of the same interaction", async () => {
    const request = {
      user_id: 1,
      oidc_client_id: 1,
      organization_id: null,
      sp_name: null,
      user_ip_address: null,
    };
    await upsertAuthorizationRequest({
      ...request,
      interaction_cid: "caliban",
      outcome: null,
      sid: null,
    });
    await upsertAuthorizationRequest({
      ...request,
      interaction_cid: "fallen",
      outcome: null,
      sid: "rock",
    });
    await upsertAuthorizationRequest({
      ...request,
      interaction_cid: "caliban",
      outcome: "succeeded",
      sid: "rock",
    });
    await upsertAuthorizationRequest({
      ...request,
      interaction_cid: "fallen",
      outcome: null,
      sid: null,
    });
    await upsertAuthorizationRequest({
      ...request,
      interaction_cid: null,
      outcome: "succeeded",
      sid: "rock",
    });
    await upsertAuthorizationRequest({
      ...request,
      interaction_cid: null,
      outcome: "succeeded",
      sid: "rock",
    });

    const { rows } = await pg.query(
      "SELECT interaction_cid, outcome, sid FROM users_oidc_clients ORDER BY id",
    );
    assert.deepEqual(rows, [
      { interaction_cid: "caliban", outcome: "succeeded", sid: "rock" },
      { interaction_cid: "fallen", outcome: null, sid: "rock" },
      { interaction_cid: null, outcome: "succeeded", sid: "rock" },
      { interaction_cid: null, outcome: "succeeded", sid: "rock" },
    ]);
  });
});
