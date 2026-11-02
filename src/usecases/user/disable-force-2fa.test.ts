//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { with_dates } from "../../repositories/dates";
import { disableForce2fa } from "./disable-force-2fa";

//

async function seed_user({ force_2fa = true }: { force_2fa?: boolean } = {}) {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    force_2fa,
    id: 1,
    updated_at: "4444-04-04",
  });
}

async function read_user() {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, 1),
  });
  assert.ok(user);
  return with_dates(user);
}

function read_activity_logs() {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

describe("disableForce2fa", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("stops forcing 2fa and journals the previous state", async () => {
    await seed_user();
    const previous = await read_user();

    const user = await disableForce2fa({ db, user_id: 1 });

    assert.deepEqual(
      { ...user, updated_at: null },
      { ...previous, force_2fa: false, updated_at: null },
    );
    assert.ok(user.updated_at instanceof Date);
    assert.notEqual(user.updated_at.getTime(), previous.updated_at.getTime());

    const current = await read_user();
    assert.deepEqual(
      { ...current, updated_at: null },
      { ...previous, force_2fa: false, updated_at: null },
    );

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.force_2fa_disabled",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { previous: { force_2fa: true } },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("writes nothing when 2fa is not forced", async () => {
    await seed_user({ force_2fa: false });
    const previous = await read_user();

    const user = await disableForce2fa({ db, user_id: 1 });

    assert.deepEqual(user, previous);
    assert.deepEqual(await read_user(), previous);
    assert.deepEqual(await read_activity_logs(), []);
  });
});
