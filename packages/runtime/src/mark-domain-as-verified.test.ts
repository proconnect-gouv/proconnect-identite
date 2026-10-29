//

import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createIdentiteRuntime } from "./index.js";

//

async function setup() {
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
    runtime: createIdentiteRuntime({ db: drizzle(pg, { schema }) }),
  };
}

describe("markDomainAsVerified", () => {
  it("❎ returns organization_not_found for an unknown organization", async () => {
    const { pg, runtime } = await setup();
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
  });

  it("✅ replaces the domain states and promotes the domain members", async () => {
    const { pg, runtime } = await setup();

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
            verified_at IS NOT NULL AS is_verified,
            created_at = '4444-04-04' AS is_seeded
          FROM email_domains
          ORDER BY organization_id, domain, verification_type
        `)
      ).rows,
      [
        {
          can_be_suggested: true,
          domain: "calibanites.world",
          is_seeded: true,
          is_verified: false,
          organization_id: 1,
          verification_type: "verified",
        },
        {
          can_be_suggested: true,
          domain: "darkangels.world",
          is_seeded: false,
          is_verified: true,
          organization_id: 1,
          verification_type: "official_contact",
        },
        {
          can_be_suggested: true,
          domain: "darkangels.world",
          is_seeded: true,
          is_verified: false,
          organization_id: 2,
          verification_type: "not_verified_yet",
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
            updated_at <> '4444-04-04' AS is_updated
          FROM users_organizations
          ORDER BY organization_id, user_id
        `)
      ).rows,
      [
        {
          is_updated: true,
          organization_id: 1,
          user_id: 1,
          verification_type: "domain",
        },
        {
          is_updated: true,
          organization_id: 1,
          user_id: 2,
          verification_type: "domain",
        },
        {
          is_updated: false,
          organization_id: 1,
          user_id: 3,
          verification_type: "organization_dirigeant",
        },
        {
          is_updated: false,
          organization_id: 1,
          user_id: 4,
          verification_type: "no_validation_means_available",
        },
        {
          is_updated: false,
          organization_id: 2,
          user_id: 1,
          verification_type: "no_validation_means_available",
        },
      ],
    );
  });

  it("❎ rolls back the domain state when a member update fails", async () => {
    const { pg, runtime } = await setup();
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
