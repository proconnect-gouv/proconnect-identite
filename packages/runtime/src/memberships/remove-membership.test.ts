//

import type { RuntimeContext } from "#src/activity";
import { createIdentiteRuntime } from "#src/runtime";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";

//

const user_quitting = {
  actor: { type: "user", user_id: 1 },
  app: "proconnect-identite",
} satisfies Pick<RuntimeContext, "actor" | "app">;

async function setup({ actor, app }: Pick<RuntimeContext, "actor" | "app">) {
  const pg = new PGlite();
  await migrate(pg);

  await pg.exec(`
    SET search_path TO public;

    INSERT INTO organizations
      (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
    VALUES
      (1, 'Dark Angels', 'Organization left by a member', '🦁', '4444-04-04', '4444-04-04'),
      (2, 'Space Wolves', 'Other organization keeping its member', '🐺', '4444-04-04', '4444-04-04');

    INSERT INTO users
      (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
    VALUES
      (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', '0', 'Primarque'),
      (2, 'azrael@darkangels.world', '4444-04-04', '4444-04-04', 'Azrael', 'Supreme', '0', 'Grand Master');

    INSERT INTO users_organizations
      (user_id, organization_id, created_at, updated_at, is_external, verification_type)
    VALUES
      (1, 1, '4444-04-04', '4444-04-04', true, 'domain_not_verified_yet'),
      (2, 1, '4444-04-04', '4444-04-04', false, 'domain'),
      (1, 2, '4444-04-04', '4444-04-04', false, 'domain');
  `);

  return {
    pg,
    runtime: createIdentiteRuntime({
      app,
      db: drizzle(pg, { schema }),
    }).as(actor),
  };
}

describe("removeMembership", () => {
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("5555-05-05") });
  });

  it("✅ removes the membership and journals it under the user", async () => {
    const { pg, runtime } = await setup(user_quitting);

    const outcome = await runtime.removeMembership({
      organization_id: 1,
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      kind: "member_removed",
      activity_id: 1,
      previous: {
        is_external: true,
        verification_type: "domain_not_verified_yet",
      },
    });
    assert.deepEqual(await memberships(pg), [
      { organization_id: 1, user_id: 2 },
      { organization_id: 2, user_id: 1 },
    ]);
    assert.deepEqual(await readActivityLogs(pg), [
      {
        action: "member.removed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: {
            is_external: true,
            verification_type: "domain_not_verified_yet",
          },
        },
        created_at: new Date("5555-05-05"),
        id: 1,
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: 1,
      },
    ]);
  });

  it("✅ journals a moderator removal under the moderator", async () => {
    const { pg, runtime } = await setup({
      actor: { type: "moderator", sub: "👮" },
      app: "hyyypertool",
    });

    await runtime.removeMembership({ organization_id: 1, user_id: 2 });

    const [activity_log] = await readActivityLogs(pg);
    assert.deepEqual(
      {
        actor_ref: activity_log.actor_ref,
        actor_type: activity_log.actor_type,
        app: activity_log.app,
      },
      { actor_ref: "👮", actor_type: "moderator", app: "hyyypertool" },
    );
  });

  it("❎ returns membership_not_found and journals nothing for a missing link", async () => {
    const { pg, runtime } = await setup(user_quitting);
    const before = await memberships(pg);

    const outcome = await runtime.removeMembership({
      organization_id: 1,
      user_id: 999,
    });

    assert.deepEqual(outcome, {
      kind: "membership_not_found",
      organization_id: 1,
      user_id: 999,
    });
    assert.deepEqual(await memberships(pg), before);
    assert.deepEqual(await readActivityLogs(pg), []);
  });

  it("❎ rolls back the removal when the journal insert fails", async () => {
    const { pg, runtime } = await setup(user_quitting);
    await pg.exec(`
      ALTER TABLE activity_logs
        ADD CONSTRAINT activity_logs_never_member_removed
        CHECK (action <> 'member.removed');
    `);
    const before = await memberships(pg);

    await assert.rejects(
      runtime.removeMembership({ organization_id: 1, user_id: 1 }),
      (error: Error) =>
        error.cause instanceof Error &&
        error.cause.message.includes("activity_logs_never_member_removed"),
    );
    assert.deepEqual(await memberships(pg), before);
  });
});

async function memberships(pg: PGlite) {
  const { rows } = await pg.query(
    "SELECT organization_id, user_id FROM users_organizations ORDER BY organization_id, user_id",
  );
  return rows;
}

async function readActivityLogs(pg: PGlite) {
  const { rows } = await pg.query<{
    actor_ref: string;
    actor_type: string;
    app: string;
  }>(`
    SELECT
      action,
      actor_ref,
      actor_type,
      app,
      cause_activity_id,
      context,
      created_at,
      id,
      interaction_cid,
      moderation_id,
      organization_id,
      user_id
    FROM activity_logs
    ORDER BY id
  `);
  return rows;
}
