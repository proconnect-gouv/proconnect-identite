import { db, emptyDatabase, migrate } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { upsertAuthorizationRequest } from "./upsert-authorization-request";

//

describe("upsertAuthorizationRequest", () => {
  before(migrate);
  beforeEach(emptyDatabase);
  beforeEach(async () => {
    await db.insert(schema.users).values({
      created_at: new Date("4444-04-04"),
      email: "lion.eljonson@darkangels.world",
      id: 1,
      updated_at: new Date("4444-04-04"),
    });
    await db.insert(schema.oidc_clients).values({
      client_id: "⚔️",
      client_name: "Dark Angels",
      client_secret: "secret",
      created_at: "4444-04-04",
      id: 1,
      updated_at: "4444-04-04",
    });
  });

  it("keeps one row per interaction and the sid an earlier write stored", async () => {
    const request = {
      oidc_client_id: 1,
      organization_id: null,
      sp_name: null,
      user_id: 1,
      user_ip_address: null,
    };
    await upsertAuthorizationRequest(db, {
      ...request,
      interaction_cid: "caliban",
      outcome: null,
      sid: null,
    });
    await upsertAuthorizationRequest(db, {
      ...request,
      interaction_cid: "fallen",
      outcome: null,
      sid: "rock",
    });
    await upsertAuthorizationRequest(db, {
      ...request,
      interaction_cid: "caliban",
      outcome: "succeeded",
      sid: "rock",
    });
    await upsertAuthorizationRequest(db, {
      ...request,
      interaction_cid: "fallen",
      outcome: null,
      sid: null,
    });
    await upsertAuthorizationRequest(db, {
      ...request,
      interaction_cid: null,
      outcome: "signed_out",
      sid: "rock",
    });
    await upsertAuthorizationRequest(db, {
      ...request,
      interaction_cid: null,
      outcome: "signed_out",
      sid: "rock",
    });

    assert.deepEqual(
      await db
        .select({
          interaction_cid: schema.users_oidc_clients.interaction_cid,
          outcome: schema.users_oidc_clients.outcome,
          sid: schema.users_oidc_clients.sid,
        })
        .from(schema.users_oidc_clients)
        .orderBy(schema.users_oidc_clients.id),
      [
        { interaction_cid: "caliban", outcome: "succeeded", sid: "rock" },
        { interaction_cid: "fallen", outcome: null, sid: "rock" },
        { interaction_cid: null, outcome: "signed_out", sid: "rock" },
        { interaction_cid: null, outcome: "signed_out", sid: "rock" },
      ],
    );
  });
});
