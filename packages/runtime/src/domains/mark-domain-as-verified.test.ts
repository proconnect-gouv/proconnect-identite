//

import type { IdentiteDatabase } from "#src/database";
import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { sql } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";

//

async function setup() {
  const db = await createTestDatabase();
  await db.insert(schema.organizations).values([
    { id: 1, siret: "🦁" },
    { id: 2, siret: "🐺" },
  ]);
  await db.insert(schema.users).values(
    [
      "lion.eljonson+promoted@darkangels.world",
      "azrael+promoted@darkangels.world",
      "luther+kept-dirigeant@darkangels.world",
      "leman.russ+kept-other-domain@spacewolves.world",
    ].map((email, index) => ({
      created_at: "4444-04-04",
      email,
      id: index + 1,
      updated_at: "4444-04-04",
    })),
  );
  await db.insert(schema.users_organizations).values(
    [
      {
        organization_id: 1,
        user_id: 1,
        verification_type:
          "no_verification_means_for_entreprise_unipersonnelle",
      },
      {
        organization_id: 1,
        user_id: 2,
        verification_type: "domain_not_verified_yet",
      },
      {
        organization_id: 1,
        user_id: 3,
        verification_type: "organization_dirigeant",
      },
      {
        organization_id: 1,
        user_id: 4,
        verification_type: "no_validation_means_available",
      },
      {
        organization_id: 2,
        user_id: 1,
        verification_type: "no_validation_means_available",
      },
    ].map((membership) => ({
      ...membership,
      created_at: "4444-04-04",
      updated_at: "4444-04-04",
    })),
  );
  await db.insert(schema.email_domains).values(
    [
      {
        domain: "darkangels.world",
        organization_id: 1,
        verification_type: "not_verified_yet",
      },
      {
        domain: "darkangels.world",
        organization_id: 1,
        verification_type: "refused",
      },
      {
        domain: "calibanites.world",
        organization_id: 1,
        verification_type: "verified",
      },
      {
        domain: "darkangels.world",
        organization_id: 2,
        verification_type: "not_verified_yet",
      },
    ].map((email_domain, index) => ({
      ...email_domain,
      created_at: "4444-04-04",
      id: index + 1,
      updated_at: "4444-04-04",
    })),
  );

  return {
    db,
    runtime: createIdentiteRuntime({ app: "hyyypertool", db }).as({
      type: "moderator",
      sub: "moderator+verifies-darkangels.world",
    }),
  };
}

describe("markDomainAsVerified", () => {
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("5555-05-05") });
  });

  it("❎ returns organization_not_found for an unknown organization", async () => {
    const { db, runtime } = await setup();
    const before = await snapshot(db);

    const outcome = await runtime.markDomainAsVerified({
      domain: "notfound.world",
      domain_verification_type: "verified",
      organization_id: 404,
    });

    assert.deepEqual(outcome, {
      kind: "organization_not_found",
      organization_id: 404,
    });
    assert.deepEqual(await snapshot(db), before);
    assert.deepEqual(await readActivityLogs(db), []);
  });

  it("✅ replaces the domain states, promotes the domain members and journals the verification under the moderator and each promotion under the app", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.markDomainAsVerified({
      domain: "darkangels.world",
      domain_verification_type: "verified",
      organization_id: 1,
    });

    const verified_domain = await db.query.email_domains.findFirst({
      columns: { id: true },
      where: (table, { and, eq }) =>
        and(eq(table.domain, "darkangels.world"), eq(table.organization_id, 1)),
    });
    assert.deepEqual(outcome, {
      kind: "domain_verified",
      activity_id: 1,
      email_domain: {
        id: verified_domain?.id,
        verification_type: "verified",
      },
      promoted_members: [
        {
          previous_verification_type:
            "no_verification_means_for_entreprise_unipersonnelle",
          user_id: 1,
        },
        { previous_verification_type: "domain_not_verified_yet", user_id: 2 },
      ],
      replaced_verification_types: ["not_verified_yet", "refused"],
    });
    assert.deepEqual(
      await db.query.email_domains.findMany({
        columns: {
          can_be_suggested: true,
          created_at: true,
          domain: true,
          organization_id: true,
          verification_type: true,
          verified_at: true,
        },
        orderBy: (table, { asc }) => [
          asc(table.organization_id),
          asc(table.domain),
          asc(table.verification_type),
        ],
      }),
      [
        {
          can_be_suggested: true,
          created_at: "4444-04-04 00:00:00+00",
          domain: "calibanites.world",
          organization_id: 1,
          verification_type: "verified",
          verified_at: null,
        },
        {
          can_be_suggested: true,
          created_at: "5555-05-05 00:00:00+00",
          domain: "darkangels.world",
          organization_id: 1,
          verification_type: "verified",
          verified_at: "5555-05-05 00:00:00+00",
        },
        {
          can_be_suggested: true,
          created_at: "4444-04-04 00:00:00+00",
          domain: "darkangels.world",
          organization_id: 2,
          verification_type: "not_verified_yet",
          verified_at: null,
        },
      ],
    );
    assert.deepEqual(
      await db.query.users_organizations.findMany({
        columns: {
          organization_id: true,
          updated_at: true,
          user_id: true,
          verification_type: true,
        },
        orderBy: (table, { asc }) => [
          asc(table.organization_id),
          asc(table.user_id),
        ],
      }),
      [
        {
          organization_id: 1,
          updated_at: "5555-05-05 00:00:00+00",
          user_id: 1,
          verification_type: "domain",
        },
        {
          organization_id: 1,
          updated_at: "5555-05-05 00:00:00+00",
          user_id: 2,
          verification_type: "domain",
        },
        {
          organization_id: 1,
          updated_at: "4444-04-04 00:00:00+00",
          user_id: 3,
          verification_type: "organization_dirigeant",
        },
        {
          organization_id: 1,
          updated_at: "4444-04-04 00:00:00+00",
          user_id: 4,
          verification_type: "no_validation_means_available",
        },
        {
          organization_id: 2,
          updated_at: "4444-04-04 00:00:00+00",
          user_id: 1,
          verification_type: "no_validation_means_available",
        },
      ],
    );
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "domain.verified",
        actor_ref: "moderator+verifies-darkangels.world",
        actor_type: "moderator",
        app: "hyyypertool",
        cause_activity_id: null,
        context: {
          inputs: {
            domain: "darkangels.world",
            verification_type: "verified",
          },
          outcome: {
            email_domain_id: verified_domain?.id,
            replaced_verification_types: ["not_verified_yet", "refused"],
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: null,
      },
      {
        action: "member.promoted",
        actor_ref: "domain.promote_members",
        actor_type: "app",
        app: "hyyypertool",
        cause_activity_id: 1,
        context: {
          inputs: {
            previous_verification_type:
              "no_verification_means_for_entreprise_unipersonnelle",
          },
          outcome: { verification_type: "domain" },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: 1,
      },
      {
        action: "member.promoted",
        actor_ref: "domain.promote_members",
        actor_type: "app",
        app: "hyyypertool",
        cause_activity_id: 1,
        context: {
          inputs: { previous_verification_type: "domain_not_verified_yet" },
          outcome: { verification_type: "domain" },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: 2,
      },
    ]);
  });

  it("❎ rolls back the domain state and its journal row when a member update fails", async () => {
    const { db, runtime } = await setup();
    await db.execute(sql`
      ALTER TABLE users_organizations
        ADD CONSTRAINT users_organizations_never_domain
        CHECK (verification_type <> 'domain')
    `);
    const before = await snapshot(db);

    await assert.rejects(
      runtime.markDomainAsVerified({
        domain: "darkangels.world",
        domain_verification_type: "verified",
        organization_id: 1,
      }),
      (error: Error) =>
        error.cause instanceof Error &&
        error.cause.message.includes("users_organizations_never_domain"),
    );
    assert.deepEqual(await snapshot(db), before);
    assert.deepEqual(await readActivityLogs(db), []);
  });
});

async function snapshot(db: IdentiteDatabase) {
  return {
    email_domains: await db.query.email_domains.findMany({
      orderBy: (table, { asc }) => asc(table.id),
    }),
    users_organizations: await db.query.users_organizations.findMany({
      orderBy: (table, { asc }) => [
        asc(table.organization_id),
        asc(table.user_id),
      ],
    }),
  };
}
