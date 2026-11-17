import {
  db,
  emptyDatabase,
  insertMembership,
  insertOidcClient,
  insertOrganization,
  insertUser,
} from "#testing";
import { origin, server } from "#testing/app";
import {
  oidc_clients,
  users_oidc_clients,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { asc, eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";

//

const AUTHORIZE_CLIENT_A = `/oauth/authorize?client_id=client_a&redirect_uri=${origin}/callback&response_type=code&scope=openid%20organization`;
const AUTHORIZE_CLIENT_B = `/oauth/authorize?client_id=client_b&redirect_uri=${origin}/callback&response_type=code&scope=openid%20organization`;

const landingUrl = (response: request.Response) =>
  new URL(String(response.redirects.at(-1)));

async function fetchUserinfo({
  agent,
  client_id,
  code,
}: {
  agent: ReturnType<typeof request.agent>;
  client_id: string;
  code: string | null;
}) {
  const token = await agent
    .post("/oauth/token")
    .type("form")
    .send({
      client_id,
      client_secret: "secret",
      code,
      grant_type: "authorization_code",
      redirect_uri: `${origin}/callback`,
    });
  const userinfo = await agent
    .get("/oauth/userinfo")
    .set("authorization", `Bearer ${token.body.access_token}`);
  return userinfo.body;
}

//

describe("oidc provider chosen organization", () => {
  let user_id: number;

  beforeEach(async () => {
    await emptyDatabase();
    for (const client_id of ["client_a", "client_b"]) {
      await insertOidcClient({
        client_id,
        redirect_uri: `${origin}/callback`,
        scope: "openid organization",
      });
    }
    user_id = await insertUser({
      email: "jean.dupont@example.gouv.fr",
      email_verified: true,
      family_name: "Dupont",
      given_name: "Jean",
    });
    for (const siret of ["11111111111111", "22222222222222"]) {
      const organization_id = await insertOrganization({ siret });
      await insertMembership({ organization_id, user_id });
    }
  });

  it("should send a user without session to sign in", async () => {
    const agent = request.agent(server);

    const authorize = await agent.get(AUTHORIZE_CLIENT_A).redirects(5);
    assert.equal(landingUrl(authorize).pathname, "/users/start-sign-in");
  });

  it("should ask a signed in user with two organizations to select one, then issue a code for it", async () => {
    const agent = request.agent(server);
    await agent.post("/test/sign-in").type("form").send({ user_id });

    const authorize = await agent.get(AUTHORIZE_CLIENT_A).redirects(5);
    assert.equal(landingUrl(authorize).pathname, "/users/select-organization");

    const select = await agent
      .post("/users/select-organization")
      .type("form")
      .send({ organization_id: 2 })
      .redirects(5);
    assert.equal(landingUrl(select).pathname, "/callback");

    const { siret } = await fetchUserinfo({
      agent,
      client_id: "client_a",
      code: landingUrl(select).searchParams.get("code"),
    });
    assert.equal(siret, "22222222222222");
  });

  it("should give a second client the organization selected in the session", async () => {
    const agent = request.agent(server);
    await agent.post("/test/sign-in").type("form").send({ user_id });

    const authorizeA = await agent.get(AUTHORIZE_CLIENT_A).redirects(5);
    assert.equal(landingUrl(authorizeA).pathname, "/users/select-organization");

    const selectA = await agent
      .post("/users/select-organization")
      .type("form")
      .send({ organization_id: 1 })
      .redirects(5);
    assert.equal(landingUrl(selectA).pathname, "/callback");

    const authorizeB = await agent.get(AUTHORIZE_CLIENT_B).redirects(5);
    assert.equal(landingUrl(authorizeB).pathname, "/callback");

    const { siret } = await fetchUserinfo({
      agent,
      client_id: "client_b",
      code: landingUrl(authorizeB).searchParams.get("code"),
    });
    assert.equal(siret, "11111111111111");
  });

  it("should switch one client with prompt=select_organization and keep the other client's organization", async () => {
    const agent = request.agent(server);
    await agent.post("/test/sign-in").type("form").send({ user_id });

    const authorizeA = await agent.get(AUTHORIZE_CLIENT_A).redirects(5);
    assert.equal(landingUrl(authorizeA).pathname, "/users/select-organization");

    const selectA = await agent
      .post("/users/select-organization")
      .type("form")
      .send({ organization_id: 1 })
      .redirects(5);
    assert.equal(landingUrl(selectA).pathname, "/callback");

    const authorizeB = await agent.get(AUTHORIZE_CLIENT_B).redirects(5);
    assert.equal(landingUrl(authorizeB).pathname, "/callback");

    const reselectB = await agent
      .get(`${AUTHORIZE_CLIENT_B}&prompt=select_organization`)
      .redirects(5);
    assert.equal(landingUrl(reselectB).pathname, "/users/select-organization");

    const selectB = await agent
      .post("/users/select-organization")
      .type("form")
      .send({ organization_id: 2 })
      .redirects(5);
    assert.equal(landingUrl(selectB).pathname, "/callback");

    const reauthorizeA = await agent.get(AUTHORIZE_CLIENT_A).redirects(5);
    assert.equal(landingUrl(reauthorizeA).pathname, "/callback");

    const { siret: siretA } = await fetchUserinfo({
      agent,
      client_id: "client_a",
      code: landingUrl(reauthorizeA).searchParams.get("code"),
    });
    assert.equal(siretA, "11111111111111");

    const { siret: siretB } = await fetchUserinfo({
      agent,
      client_id: "client_b",
      code: landingUrl(selectB).searchParams.get("code"),
    });
    assert.equal(siretB, "22222222222222");

    assert.deepEqual(
      await db
        .select({
          client_id: oidc_clients.client_id,
          organization_id: users_oidc_clients.organization_id,
          outcome: users_oidc_clients.outcome,
        })
        .from(users_oidc_clients)
        .innerJoin(
          oidc_clients,
          eq(oidc_clients.id, users_oidc_clients.oidc_client_id),
        )
        .orderBy(asc(users_oidc_clients.id)),
      [
        { client_id: "client_a", organization_id: 1, outcome: "succeeded" },
        { client_id: "client_b", organization_id: 1, outcome: "succeeded" },
        { client_id: "client_b", organization_id: 2, outcome: "succeeded" },
        { client_id: "client_a", organization_id: 1, outcome: "succeeded" },
      ],
    );
  });

  it("should switch a client to the organization given by siret_hint", async () => {
    const agent = request.agent(server);
    await agent.post("/test/sign-in").type("form").send({ user_id });

    const authorize = await agent.get(AUTHORIZE_CLIENT_A).redirects(5);
    assert.equal(landingUrl(authorize).pathname, "/users/select-organization");

    const select = await agent
      .post("/users/select-organization")
      .type("form")
      .send({ organization_id: 1 })
      .redirects(5);
    assert.equal(landingUrl(select).pathname, "/callback");

    const hinted = await agent
      .get(`${AUTHORIZE_CLIENT_A}&siret_hint=22222222222222`)
      .redirects(5);
    assert.equal(landingUrl(hinted).pathname, "/callback");

    const { siret } = await fetchUserinfo({
      agent,
      client_id: "client_a",
      code: landingUrl(hinted).searchParams.get("code"),
    });
    assert.equal(siret, "22222222222222");
  });
});
