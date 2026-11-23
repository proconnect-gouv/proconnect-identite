import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { KoaContextWithOIDC, Session } from "oidc-provider";
import type { GrantOrganization } from "../repositories/redis/grant-organization";
import {
  findAuthorizedOrganizationFactory,
  getAuthorizedOrganizationFactory,
} from "./oidc-authorized-organization";

//

type AuthorizationsHolder = Pick<Session, "authorizations">;

// in-memory stub of the pci:grant-organization Redis repository
const grantOrganizationsStub =
  (records: Record<string, GrantOrganization>) => async (grantId: string) =>
    records[grantId];

const getAuthorizedOrganization = getAuthorizedOrganizationFactory({
  getGrantOrganization: grantOrganizationsStub({
    "grant-with-record": { organizationId: 1, acr: "eidas1" },
  }),
});

const findAuthorizedOrganization = findAuthorizedOrganizationFactory({
  getGrantOrganization: grantOrganizationsStub({
    "grant-with-record": { organizationId: 1, acr: "eidas1" },
  }),
});

const legacySession: AuthorizationsHolder = {
  authorizations: {
    client: { sid: "sid", organizationId: 2, acr: "eidas0" },
    other: { sid: "sid", organizationId: 3, acr: "eidas1" },
  },
};

const authorizationCtx = ({
  grant,
  session,
}: {
  grant?: { jti?: string };
  session?: AuthorizationsHolder;
}) =>
  ({
    oidc: {
      client: { clientId: "client" },
      entities: { Grant: grant },
      session,
    },
  }) as unknown as KoaContextWithOIDC;

const ctxWithSessions = (sessions: Record<string, AuthorizationsHolder>) =>
  ({
    oidc: {
      provider: {
        Session: {
          findByUid: async (uid: string) => sessions[uid],
        },
      },
    },
  }) as unknown as KoaContextWithOIDC;

describe("getAuthorizedOrganization", () => {
  it("should prefer the grant record over the legacy session entry", async () => {
    const ctx = authorizationCtx({
      grant: { jti: "grant-with-record" },
      session: legacySession,
    });

    assert.deepEqual(await getAuthorizedOrganization(ctx), {
      organizationId: 1,
      acr: "eidas1",
    });
  });

  it("should fall back to the legacy session entry without record", async () => {
    const ctx = authorizationCtx({
      grant: { jti: "grant-without-record" },
      session: legacySession,
    });

    assert.deepEqual(await getAuthorizedOrganization(ctx), {
      organizationId: 2,
      acr: "eidas0",
    });
  });

  it("should return undefined without record nor legacy entry", async () => {
    const ctx = authorizationCtx({
      grant: { jti: "grant-without-record" },
      session: { authorizations: { other: { organizationId: 3 } } },
    });

    assert.equal(await getAuthorizedOrganization(ctx), undefined);
  });

  it("should return undefined without record nor session", async () => {
    const ctx = authorizationCtx({ grant: { jti: "grant-without-record" } });

    assert.equal(await getAuthorizedOrganization(ctx), undefined);
  });

  it("should fall back to the legacy session entry without grant", async () => {
    const ctx = authorizationCtx({ session: legacySession });

    assert.deepEqual(await getAuthorizedOrganization(ctx), {
      organizationId: 2,
      acr: "eidas0",
    });
  });

  it("should fall back to the legacy session entry when the grant has no jti", async () => {
    const ctx = authorizationCtx({ grant: {}, session: legacySession });

    assert.deepEqual(await getAuthorizedOrganization(ctx), {
      organizationId: 2,
      acr: "eidas0",
    });
  });

  it("should return undefined without grant nor session", async () => {
    assert.equal(
      await getAuthorizedOrganization(authorizationCtx({})),
      undefined,
    );
  });
});

describe("findAuthorizedOrganization", () => {
  const ctx = ctxWithSessions({ "session-uid": legacySession });

  it("should return undefined without token", async () => {
    assert.equal(await findAuthorizedOrganization(ctx, undefined), undefined);
  });

  it("should return undefined without grantId", async () => {
    assert.equal(
      await findAuthorizedOrganization(ctx, {
        sessionUid: "session-uid",
        clientId: "client",
      }),
      undefined,
    );
  });

  it("should return the grant record", async () => {
    assert.deepEqual(
      await findAuthorizedOrganization(ctx, {
        grantId: "grant-with-record",
        sessionUid: "session-uid",
        clientId: "client",
      }),
      { organizationId: 1, acr: "eidas1" },
    );
  });

  it("should fall back to the legacy entry of the token session without record", async () => {
    assert.deepEqual(
      await findAuthorizedOrganization(ctx, {
        grantId: "grant-without-record",
        sessionUid: "session-uid",
        clientId: "client",
      }),
      { organizationId: 2, acr: "eidas0" },
    );
  });

  it("should return undefined without record nor sessionUid", async () => {
    assert.equal(
      await findAuthorizedOrganization(ctx, {
        grantId: "grant-without-record",
        clientId: "client",
      }),
      undefined,
    );
  });

  it("should return undefined without record when the session is not found", async () => {
    assert.equal(
      await findAuthorizedOrganization(ctx, {
        grantId: "grant-without-record",
        sessionUid: "unknown-uid",
        clientId: "client",
      }),
      undefined,
    );
  });
});
