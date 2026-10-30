//

import type { RuntimeContext } from "#src/activity";
import type { IdentiteDatabase } from "#src/database";
import { createIdentiteRuntime } from "#src/runtime";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import type { FranceConnectUserInfoResponse } from "@proconnect-gouv/proconnect.identite/types";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

const user_connecting = {
  actor: { type: "user", user_id: 1 },
  app: "proconnect-identite",
} satisfies Pick<RuntimeContext, "actor" | "app">;

const user_info: FranceConnectUserInfoResponse = {
  birthcountry: "99100",
  birthdate: new Date("1970-01-01"),
  birthplace: "Toulon",
  family_name: "Valjean",
  gender: "male",
  given_name: "Jean Valjean",
  sub: "fc-sub-jean",
};

async function setup({ actor, app }: Pick<RuntimeContext, "actor" | "app">) {
  const pg = new PGlite();
  await migrate(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);

  await db.insert(schema.users).values([
    {
      created_at: "4444-04-04",
      email: "jean.valjean@republic.fr",
      family_name: "Fauchelevent",
      given_name: "Jeannot",
      id: 1,
      updated_at: "4444-04-04",
    },
    {
      created_at: "4444-04-04",
      email: "cosette@republic.fr",
      family_name: "Fauchelevent",
      given_name: "Cosette",
      id: 2,
      updated_at: "4444-04-04",
    },
  ]);

  return {
    db,
    runtime: createIdentiteRuntime({ app, db }).as(actor),
  };
}

describe("connectFranceConnect", () => {
  it("✅ links the identity, copies the FranceConnect names and journals it", async () => {
    const { db, runtime } = await setup(user_connecting);

    const outcome = await runtime.connectFranceConnect({
      user_id: 1,
      user_info,
    });

    assert.equal(outcome.kind, "franceconnect_connected");
    if (outcome.kind !== "franceconnect_connected") return;
    assert.deepEqual(outcome.user, {
      family_name: "Valjean",
      given_name: "Jean",
    });
    assert.deepEqual(await users(db), [
      { family_name: "Valjean", given_name: "Jean", id: 1 },
      { family_name: "Fauchelevent", given_name: "Cosette", id: 2 },
    ]);
    assert.deepEqual(await identities(db), [
      {
        birthcountry: "99100",
        birthdate: "1970-01-01 00:00:00+00",
        birthplace: "Toulon",
        family_name: "Valjean",
        gender: "male",
        given_name: "Jean Valjean",
        sub: "fc-sub-jean",
        user_id: 1,
      },
    ]);
    assert.deepEqual(await activityLogs(db), [
      {
        action: "franceconnect.connected",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { connected_at: outcome.connected_at },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("✅ replaces an existing identity and keeps its creation date", async () => {
    const { db, runtime } = await setup(user_connecting);
    await db.insert(schema.franceconnect_userinfo).values({
      created_at: "4444-04-04",
      family_name: "Valjean",
      given_name: "Jean",
      sub: "old-sub",
      updated_at: "4444-04-04",
      user_id: 1,
    });

    const outcome = await runtime.connectFranceConnect({
      user_id: 1,
      user_info,
    });

    assert.equal(outcome.kind, "franceconnect_connected");
    if (outcome.kind !== "franceconnect_connected") return;
    assert.match(outcome.connected_at, /^4444-04-04/);
    assert.deepEqual(await identities(db), [
      {
        birthcountry: "99100",
        birthdate: "1970-01-01 00:00:00+00",
        birthplace: "Toulon",
        family_name: "Valjean",
        gender: "male",
        given_name: "Jean Valjean",
        sub: "fc-sub-jean",
        user_id: 1,
      },
    ]);
    assert.equal((await activityLogs(db)).length, 1);
  });

  it("❎ returns user_not_found for an unknown user and writes nothing", async () => {
    const { db, runtime } = await setup(user_connecting);

    const outcome = await runtime.connectFranceConnect({
      user_id: 404,
      user_info,
    });

    assert.deepEqual(outcome, { kind: "user_not_found", user_id: 404 });
    assert.deepEqual(await identities(db), []);
    assert.deepEqual(await activityLogs(db), []);
  });

  it("❎ rolls back the names and the identity when the journal insert fails", async () => {
    const { db, runtime } = await setup(user_connecting);
    await db.execute(sql`
      ALTER TABLE activity_logs
        ADD CONSTRAINT activity_logs_never_franceconnect_connected
        CHECK (action <> 'franceconnect.connected')
    `);

    await assert.rejects(
      runtime.connectFranceConnect({ user_id: 1, user_info }),
      (error: Error) =>
        error.cause instanceof Error &&
        error.cause.message.includes(
          "activity_logs_never_franceconnect_connected",
        ),
    );
    assert.deepEqual(await users(db), [
      { family_name: "Fauchelevent", given_name: "Jeannot", id: 1 },
      { family_name: "Fauchelevent", given_name: "Cosette", id: 2 },
    ]);
    assert.deepEqual(await identities(db), []);
  });
});

function users(db: IdentiteDatabase) {
  return db.query.users.findMany({
    columns: { family_name: true, given_name: true, id: true },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

function identities(db: IdentiteDatabase) {
  return db.query.franceconnect_userinfo.findMany({
    columns: {
      birthcountry: true,
      birthdate: true,
      birthplace: true,
      family_name: true,
      gender: true,
      given_name: true,
      sub: true,
      user_id: true,
    },
    orderBy: (table, { asc }) => asc(table.user_id),
  });
}

function activityLogs(db: IdentiteDatabase) {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}
