import {
  db,
  empty_database,
  insert_email_domain,
  insert_membership,
  insert_organization,
  insert_user,
  migrate,
} from "#testing";
import { isAFreeDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { getOrganizationSuggestions } from "./organization-suggestions";

//

const dependencies = {
  db,
  maxSuggestedOrganizations: 3,
  usesAFreeEmailProvider: isAFreeDomain,
};

const suggest = ({ email, user_id }: { email: string; user_id: number }) =>
  getOrganizationSuggestions({ email, user_id }, dependencies);

describe("getOrganizationSuggestions", () => {
  before(migrate);
  beforeEach(async () => empty_database(db));

  it("suggests an active organization owning the email domain", async () => {
    const [{ id: organization_id }] = await db
      .insert(organizations)
      .values({
        cached_adresse: "1 rue de la Paix",
        cached_est_active: true,
        cached_libelle: "Dark Angels",
        cached_siege_social: true,
        siret: "🦁",
      })
      .returning({ id: organizations.id });
    await insert_email_domain(db, {
      domain: "darkangels.world",
      organization_id,
      verification_type: "verified",
    });

    const suggestions = await suggest({
      email: "prospect@darkangels.world",
      user_id: 1,
    });

    assert.deepEqual(
      suggestions.map(
        ({
          cached_adresse,
          cached_libelle,
          cached_siege_social,
          id,
          siret,
        }) => ({
          cached_adresse,
          cached_libelle,
          cached_siege_social,
          id,
          siret,
        }),
      ),
      [
        {
          cached_adresse: "1 rue de la Paix",
          cached_libelle: "Dark Angels",
          cached_siege_social: true,
          id: organization_id,
          siret: "🦁",
        },
      ],
    );
  });

  it("ignores inactive organizations, refused domains and unrelated domains", async () => {
    const inactive_organization_id = await insert_organization(db, {
      cached_est_active: false,
      siret: "🦁",
    });
    await insert_email_domain(db, {
      domain: "darkangels.world",
      organization_id: inactive_organization_id,
      verification_type: "verified",
    });
    const refused_domain_organization_id = await insert_organization(db, {
      siret: "🦅",
    });
    await insert_email_domain(db, {
      domain: "darkangels.world",
      organization_id: refused_domain_organization_id,
      verification_type: "refused",
    });
    const pending_domain_organization_id = await insert_organization(db, {
      siret: "🦉",
    });
    await insert_email_domain(db, {
      domain: "darkangels.world",
      organization_id: pending_domain_organization_id,
      verification_type: "not_verified_yet",
    });

    const suggestions = await suggest({
      email: "prospect@darkangels.world",
      user_id: 1,
    });

    assert.deepEqual(suggestions, []);
  });

  it("returns no suggestions when no organization owns the email domain", async () => {
    const organization_id = await insert_organization(db, { siret: "🦁" });
    await insert_email_domain(db, {
      domain: "darkangels.world",
      organization_id,
      verification_type: "verified",
    });

    const suggestions = await suggest({
      email: "prospect@ultramarines.world",
      user_id: 1,
    });

    assert.deepEqual(suggestions, []);
  });

  it("returns no suggestions when the user already belongs to an organization", async () => {
    const user_id = await insert_user(db, {
      email: "prospect@darkangels.world",
    });
    const organization_id = await insert_organization(db, { siret: "🦁" });
    await insert_email_domain(db, {
      domain: "darkangels.world",
      organization_id,
      verification_type: "verified",
    });
    await insert_membership(db, { organization_id, user_id });

    const suggestions = await suggest({
      email: "prospect@darkangels.world",
      user_id,
    });

    assert.deepEqual(suggestions, []);
  });

  it("returns no suggestions for a free email provider address", async () => {
    const organization_id = await insert_organization(db, { siret: "🦁" });
    await insert_email_domain(db, {
      domain: "gmail.com",
      organization_id,
      verification_type: "verified",
    });

    const suggestions = await suggest({
      email: "prospect@gmail.com",
      user_id: 1,
    });

    assert.deepEqual(suggestions, []);
  });

  it("keeps only the organizations above 20% of the members when there are too many suggestions", async () => {
    const organization_ids: number[] = [];
    for (const siret of ["🦁", "🦅", "🦉", "🦄"]) {
      const organization_id = await insert_organization(db, { siret });
      await insert_email_domain(db, {
        domain: "darkangels.world",
        organization_id,
        verification_type: "verified",
      });
      organization_ids.push(organization_id);
    }
    const [first, second, third, fourth] = organization_ids;

    const member_ids: number[] = [];
    for (const member of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      member_ids.push(
        await insert_user(db, { email: `member${member}@darkangels.world` }),
      );
    }
    for (const user_id of member_ids.slice(0, 5)) {
      await insert_membership(db, { organization_id: first, user_id });
    }
    for (const user_id of member_ids.slice(5, 7)) {
      await insert_membership(db, { organization_id: second, user_id });
    }
    for (const user_id of member_ids.slice(7, 8)) {
      await insert_membership(db, { organization_id: third, user_id });
    }
    for (const user_id of member_ids.slice(8)) {
      await insert_membership(db, { organization_id: fourth, user_id });
    }

    const suggestions = await suggest({
      email: "prospect@darkangels.world",
      user_id: 100,
    });

    assert.equal(suggestions[0]?.id, first);
    assert.deepEqual(
      new Set(suggestions.map(({ id }) => id)),
      new Set([first, second, fourth]),
    );
  });

  it("returns no suggestions when the matching organizations have no matching members", async () => {
    for (const siret of ["🦁", "🦅", "🦉", "🦄"]) {
      const organization_id = await insert_organization(db, { siret });
      await insert_email_domain(db, {
        domain: "darkangels.world",
        organization_id,
        verification_type: "verified",
      });
    }

    const suggestions = await suggest({
      email: "prospect@darkangels.world",
      user_id: 100,
    });

    assert.deepEqual(suggestions, []);
  });

  it("suggests the army organization for army email addresses", async () => {
    const [{ id: army_organization_id }] = await db
      .insert(organizations)
      .values({
        cached_adresse: "60 boulevard du Général Martial Valin",
        cached_libelle: "Ministère des Armées",
        cached_siege_social: false,
        siret: "11009001600053",
      })
      .returning({ id: organizations.id });
    const other_organization_id = await insert_organization(db, {
      siret: "🦁",
    });
    await insert_email_domain(db, {
      domain: "intradef.gouv.fr",
      organization_id: other_organization_id,
      verification_type: "verified",
    });

    const suggestions = await suggest({
      email: "soldat@intradef.gouv.fr",
      user_id: 1,
    });

    assert.deepEqual(suggestions, [
      {
        cached_adresse: "60 boulevard du Général Martial Valin",
        cached_libelle: "Ministère des Armées",
        cached_siege_social: false,
        id: army_organization_id,
        siret: "11009001600053",
      },
    ]);
  });

  it("returns no suggestions for education nationale email addresses", async () => {
    const organization_id = await insert_organization(db, { siret: "🦁" });
    await insert_email_domain(db, {
      domain: "ac-paris.fr",
      organization_id,
      verification_type: "verified",
    });

    const suggestions = await suggest({
      email: "professeur@ac-paris.fr",
      user_id: 1,
    });

    assert.deepEqual(suggestions, []);
  });
});
