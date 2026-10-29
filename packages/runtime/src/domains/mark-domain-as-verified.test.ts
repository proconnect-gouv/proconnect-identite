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

const join_official_contact = {
  actor: { type: "app", job: "join.official_contact" },
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
      (1, 'Dark Angels', 'Organization verifying darkangels.world', '🦁', '4444-04-04', '4444-04-04'),
      (2, 'Space Wolves', 'Other organization using darkangels.world', '🐺', '4444-04-04', '4444-04-04');

    INSERT INTO users
      (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
    VALUES
      (1, 'lion.eljonson+promoted@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', '0', 'Primarque'),
      (2, 'azrael+promoted@darkangels.world', '4444-04-04', '4444-04-04', 'Azrael', 'Supreme', '0', 'Grand Master'),
      (3, 'luther+kept-dirigeant@darkangels.world', '4444-04-04', '4444-04-04', 'Luther', 'Fallen', '0', 'Second'),
      (4, 'leman.russ+kept-other-domain@spacewolves.world', '4444-04-04', '4444-04-04', 'Leman', 'Russ', '0', 'Primarque');

    INSERT INTO users_organizations
      (user_id, organization_id, created_at, updated_at, is_external, verification_type)
    VALUES
      (1, 1, '4444-04-04', '4444-04-04', false, 'no_verification_means_for_entreprise_unipersonnelle'),
      (2, 1, '4444-04-04', '4444-04-04', false, 'domain_not_verified_yet'),
      (3, 1, '4444-04-04', '4444-04-04', false, 'organization_dirigeant'),
      (4, 1, '4444-04-04', '4444-04-04', false, 'no_validation_means_available'),
      (1, 2, '4444-04-04', '4444-04-04', false, 'no_validation_means_available');

    INSERT INTO email_domains
      (id, organization_id, domain, verification_type, created_at, updated_at)
    VALUES
      (1, 1, 'darkangels.world', 'not_verified_yet', '4444-04-04', '4444-04-04'),
      (2, 1, 'darkangels.world', 'refused', '4444-04-04', '4444-04-04'),
      (3, 1, 'calibanites.world', 'verified', '4444-04-04', '4444-04-04'),
      (4, 2, 'darkangels.world', 'not_verified_yet', '4444-04-04', '4444-04-04');
  `);

  return {
    pg,
    runtime: createIdentiteRuntime({
      app,
      db: drizzle(pg, { schema }),
    }).as(actor),
  };
}

describe("markDomainAsVerified", () => {
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("5555-05-05") });
  });

  it("❎ returns organization_not_found for an unknown organization", async () => {
    const { pg, runtime } = await setup(join_official_contact);
    const before = await snapshot(pg);

    const outcome = await runtime.markDomainAsVerified({
      domain: "notfound.world",
      domain_verification_type: "official_contact",
      organization_id: 404,
    });

    assert.deepEqual(outcome, {
      kind: "organization_not_found",
      organization_id: 404,
    });
    assert.deepEqual(await snapshot(pg), before);
    assert.deepEqual(await readActivityLogs(pg), []);
  });

  it("✅ replaces the domain states, promotes the domain members and journals the verification", async () => {
    const { pg, runtime } = await setup(join_official_contact);

    const outcome = await runtime.markDomainAsVerified({
      domain: "darkangels.world",
      domain_verification_type: "official_contact",
      organization_id: 1,
    });

    const {
      rows: [official_contact_domain],
    } = await pg.query<{ id: number }>(
      "SELECT id FROM email_domains WHERE verification_type = 'official_contact'",
    );
    assert.deepEqual(outcome, {
      kind: "domain_verified",
      activity_id: 1,
      email_domain: {
        id: official_contact_domain?.id,
        verification_type: "official_contact",
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
      (
        await pg.query(`
          SELECT
            organization_id,
            domain,
            verification_type,
            can_be_suggested,
            created_at,
            verified_at
          FROM email_domains
          ORDER BY organization_id, domain, verification_type
        `)
      ).rows,
      [
        {
          can_be_suggested: true,
          created_at: new Date("4444-04-04"),
          domain: "calibanites.world",
          organization_id: 1,
          verification_type: "verified",
          verified_at: null,
        },
        {
          can_be_suggested: true,
          created_at: new Date("5555-05-05"),
          domain: "darkangels.world",
          organization_id: 1,
          verification_type: "official_contact",
          verified_at: new Date("5555-05-05"),
        },
        {
          can_be_suggested: true,
          created_at: new Date("4444-04-04"),
          domain: "darkangels.world",
          organization_id: 2,
          verification_type: "not_verified_yet",
          verified_at: null,
        },
      ],
    );
    assert.deepEqual(
      (
        await pg.query(`
          SELECT
            organization_id,
            user_id,
            verification_type,
            updated_at
          FROM users_organizations
          ORDER BY organization_id, user_id
        `)
      ).rows,
      [
        {
          organization_id: 1,
          updated_at: new Date("5555-05-05"),
          user_id: 1,
          verification_type: "domain",
        },
        {
          organization_id: 1,
          updated_at: new Date("5555-05-05"),
          user_id: 2,
          verification_type: "domain",
        },
        {
          organization_id: 1,
          updated_at: new Date("4444-04-04"),
          user_id: 3,
          verification_type: "organization_dirigeant",
        },
        {
          organization_id: 1,
          updated_at: new Date("4444-04-04"),
          user_id: 4,
          verification_type: "no_validation_means_available",
        },
        {
          organization_id: 2,
          updated_at: new Date("4444-04-04"),
          user_id: 1,
          verification_type: "no_validation_means_available",
        },
      ],
    );
    assert.deepEqual(await readActivityLogs(pg), [
      {
        action: "domain.verified",
        actor_ref: "join.official_contact",
        actor_type: "app",
        app: "proconnect-identite",
        context: {
          inputs: {
            domain: "darkangels.world",
            verification_type: "official_contact",
          },
          outcome: {
            email_domain_id: official_contact_domain?.id,
            replaced_verification_types: ["not_verified_yet", "refused"],
          },
        },
        created_at: new Date("5555-05-05"),
        id: 1,
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: null,
      },
    ]);
  });

  it("✅ journals the verification under the moderator", async () => {
    const { pg, runtime } = await setup({
      actor: { type: "moderator", sub: "moderator+verifies-darkangels.world" },
      app: "hyyypertool",
    });

    const outcome = await runtime.markDomainAsVerified({
      domain: "darkangels.world",
      domain_verification_type: "verified",
      organization_id: 1,
    });

    const {
      rows: [verified_domain],
    } = await pg.query<{ id: number }>(
      "SELECT id FROM email_domains WHERE domain = 'darkangels.world' AND verification_type = 'verified'",
    );
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
    assert.deepEqual(await readActivityLogs(pg), [
      {
        action: "domain.verified",
        actor_ref: "moderator+verifies-darkangels.world",
        actor_type: "moderator",
        app: "hyyypertool",
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
        created_at: new Date("5555-05-05"),
        id: 1,
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: null,
      },
    ]);
  });

  it("❎ rolls back the domain state and its journal row when a member update fails", async () => {
    const { pg, runtime } = await setup(join_official_contact);
    await pg.exec(`
      ALTER TABLE users_organizations
        ADD CONSTRAINT users_organizations_never_domain
        CHECK (verification_type <> 'domain');
    `);
    const before = await snapshot(pg);

    await assert.rejects(
      runtime.markDomainAsVerified({
        domain: "darkangels.world",
        domain_verification_type: "official_contact",
        organization_id: 1,
      }),
      (error: Error) =>
        error.cause instanceof Error &&
        error.cause.message.includes("users_organizations_never_domain"),
    );
    assert.deepEqual(await snapshot(pg), before);
    assert.deepEqual(await readActivityLogs(pg), []);
  });
});

async function snapshot(pg: PGlite) {
  const [{ rows: email_domains }, { rows: users_organizations }] =
    await Promise.all([
      pg.query("SELECT * FROM email_domains ORDER BY id"),
      pg.query(
        "SELECT * FROM users_organizations ORDER BY organization_id, user_id",
      ),
    ]);
  return { email_domains, users_organizations };
}

async function readActivityLogs(pg: PGlite) {
  const { rows } = await pg.query(`
    SELECT
      action,
      actor_ref,
      actor_type,
      app,
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
