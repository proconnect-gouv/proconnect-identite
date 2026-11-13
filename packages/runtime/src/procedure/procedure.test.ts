//

import { procedure } from "#src/procedure";
import { createIdentiteRuntime } from "#src/runtime";
import { userActivities } from "#src/users";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as z from "zod";

//

async function given() {
  const db = await createTestDatabase();
  await db.insert(schema.users).values({
    created_at: new Date("4444-04-04"),
    email: "jean.valjean@republic.fr",
    encrypted_password: "old-hash",
    id: 1,
    updated_at: new Date("4444-04-04"),
  });
  await db.insert(schema.organizations).values({
    created_at: "4444-04-04",
    id: 1,
    siret: "21340126800130",
    updated_at: "4444-04-04",
  });
  await db.insert(schema.users_organizations).values({
    created_at: "4444-04-04",
    organization_id: 1,
    updated_at: "4444-04-04",
    user_id: 1,
    verification_type: "no_validation_means_available",
  });
  return {
    db,
    journal: () => readActivityLogs(db),
    runtime: createIdentiteRuntime({
      app: "proconnect-identite",
      db,
      procedures: { test: { job_renamed: jobRenamed } },
    }).as({ type: "user", user_id: 1 }),
    users: () => db.query.users.findMany(),
  };
}

const jobRenamed = procedure
  .inputs(z.object({ job: z.string() }))
  .private(z.object({ secret: z.string(), user_id: z.number() }))
  .outcome(z.object({ previous: z.string().nullable() }))
  .mutation(async ({ inputs: { job }, private: { secret, user_id }, tx }) => {
    if (job === "unchanged") return { kind: "job_unchanged" } as const;
    const [previous] = await tx
      .select({ encrypted_password: schema.users.encrypted_password })
      .from(schema.users)
      .where(eq(schema.users.id, user_id));
    await tx
      .update(schema.users)
      .set({ encrypted_password: secret, job })
      .where(eq(schema.users.id, user_id));
    if (job === "explode") throw new Error("boom");
    return {
      journal: {
        // the whole row leaks the old hash unless the context schema strips it
        outcome: { previous: null, ...previous },
        targets: { user_id },
      },
      kind: "job_renamed",
    } as const;
  });

describe("procedure", () => {
  it("✅ journals the inputs and the parsed outcome, never the private part", async () => {
    const { journal, runtime } = await given();

    const outcome = await runtime.test.job_renamed.mutate({
      job: "baker",
      secret: "new-hash",
      user_id: 1,
    });

    assert.deepEqual(outcome, { activity_id: 1, kind: "job_renamed" });
    const [row] = await journal();
    assert.deepEqual(row?.context, {
      inputs: { job: "baker" },
      outcome: { previous: null },
    });
    assert.equal(JSON.stringify(row).includes("hash"), false);
  });

  it("❎ writes nothing for an outcome without a journal", async () => {
    const { journal, runtime } = await given();

    const outcome = await runtime.test.job_renamed.mutate({
      job: "unchanged",
      secret: "new-hash",
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "job_unchanged" });
    assert.deepEqual(await journal(), []);
  });

  it("❎ rolls back the state write when the mutation throws", async () => {
    const { journal, runtime, users } = await given();

    await assert.rejects(
      runtime.test.job_renamed.mutate({
        job: "explode",
        secret: "new-hash",
        user_id: 1,
      }),
      /boom/,
    );

    const [user] = await users();
    assert.equal(user?.encrypted_password, "old-hash");
    assert.deepEqual(await journal(), []);
  });

  it("❎ rejects invalid input before touching the database", async () => {
    const { journal, runtime } = await given();

    await assert.rejects(
      runtime.test.job_renamed.mutate({
        job: "baker",
        user_id: 1,
      } as never),
      z.ZodError,
    );

    assert.deepEqual(await journal(), []);
  });

  it("✅ composes with a shared procedure in the same transaction", async () => {
    const { db, journal, users } = await given();
    const quitAndExplode = procedure
      .inputs(z.object({}))
      .outcome(z.object({}))
      .mutation(async ({ actor, tx }) => {
        await createIdentiteRuntime({ app: "proconnect-identite", db: tx })
          .as(actor)
          .user.deleted.mutate({ user_id: 1 });
        throw new Error("after the nested procedure");
      });

    await assert.rejects(
      createIdentiteRuntime({
        app: "proconnect-identite",
        db,
        procedures: { test: { quit: quitAndExplode } },
      })
        .as({ type: "user", user_id: 1 })
        .test.quit.mutate({}),
      /after the nested procedure/,
    );

    assert.equal((await users()).length, 1);
    assert.deepEqual(await journal(), []);
  });

  it("❎ refuses a local procedure that redefines a shared action", async () => {
    const { db } = await given();

    assert.throws(
      () =>
        createIdentiteRuntime({
          app: "proconnect-identite",
          db,
          procedures: { user: { deleted: jobRenamed } } as never,
        }),
      /user.deleted/,
    );
  });

  it("❎ refuses a local procedure that writes a published action with its own schema", async () => {
    const { db } = await given();
    const { inputs } = userActivities["user.password_changed"].shape;
    const drifted = procedure
      .inputs(inputs)
      .outcome(
        z.object({ previous: z.object({ email_verified: z.boolean() }) }),
      )
      .mutation(async () => ({ kind: "noop" }) as const);

    assert.throws(
      () =>
        createIdentiteRuntime({
          app: "proconnect-identite",
          db,
          procedures: { user: { password_changed: drifted } },
        }),
      /user.password_changed: build the procedure from the published schema/,
    );
  });

  it("❎ refuses a key that is both journaled and private", () => {
    assert.throws(
      () =>
        procedure
          .inputs(z.object({ user_id: z.number() }))
          .private(z.object({ user_id: z.number() })),
      /keys both journaled and private: user_id/,
    );
  });
});
