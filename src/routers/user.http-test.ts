import {
  insert_email_domain,
  insert_organization,
  insert_user,
} from "#testing/database";
import {
  close_connections,
  create_session_cookie,
  createApp,
  db,
  delete_suggestion_fixture,
} from "#testing/http";
import type { Express } from "express";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import request from "supertest";

const domain = `suggestions-${randomUUID()}.darkangels.world`;

let app: Express;
let organization_id: number;
let user_id: number;

before(async () => {
  app = await createApp();

  organization_id = await insert_organization(db, {
    cached_adresse: "1 rue de la Paix",
    cached_libelle: "Dark Angels",
    cached_siege_social: true,
    siret: `${Date.now()}`.padStart(14, "0").slice(-14),
  });
  await insert_email_domain(db, {
    domain,
    organization_id,
    verification_type: "verified",
  });
  user_id = await insert_user(db, { email: `prospect@${domain}` });
});

after(async () => {
  await delete_suggestion_fixture({ domain, organization_id, user_id });
  await close_connections();
});

describe("GET /users/organization-suggestions", () => {
  it("suggests the organization owning the user email domain", async () => {
    const response = await request(app)
      .get("/users/organization-suggestions")
      .set("Cookie", await create_session_cookie({ user_id }));

    assert.equal(response.status, 200);
    assert.match(response.text, /Dark Angels/);
  });

  it("redirects an unauthenticated request to the sign in page", async () => {
    const response = await request(app).get("/users/organization-suggestions");

    assert.equal(response.status, 302);
    assert.equal(response.headers["location"], "/users/start-sign-in");
  });
});
