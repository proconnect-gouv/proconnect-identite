import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { KoaContextWithOIDC, Session } from "oidc-provider";
import {
  findAuthorizedOrganization,
  getAuthorizedOrganization,
  setAuthorizedOrganization,
} from "./oidc-authorized-organization";

//

type AuthorizationsHolder = Pick<Session, "authorizations">;

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
  it("should return undefined without session", () => {
    assert.equal(getAuthorizedOrganization(undefined, "client"), undefined);
  });

  it("should return undefined without clientId", () => {
    const session = {
      authorizations: { client: { organizationId: 1, acr: "eidas1" } },
    };

    assert.equal(getAuthorizedOrganization(session, undefined), undefined);
  });

  it("should return undefined without entry for the client", () => {
    const session = {
      authorizations: { other: { organizationId: 1, acr: "eidas1" } },
    };

    assert.equal(getAuthorizedOrganization(session, "client"), undefined);
  });

  it("should return undefined without organizationId", () => {
    const session = {
      authorizations: { client: { sid: "sid", grantId: "grantId" } },
    };

    assert.equal(getAuthorizedOrganization(session, "client"), undefined);
  });

  it("should return the organization and acr of the client", () => {
    const session = {
      authorizations: {
        client: { sid: "sid", organizationId: 1, acr: "eidas1" },
        other: { sid: "sid", organizationId: 2, acr: "eidas0" },
      },
    };

    assert.deepEqual(getAuthorizedOrganization(session, "client"), {
      organizationId: 1,
      acr: "eidas1",
    });
  });
});

describe("setAuthorizedOrganization", () => {
  it("should keep sid, grantId and other clients entries", () => {
    const session: AuthorizationsHolder = {
      authorizations: {
        client: { sid: "sid", grantId: "grantId", organizationId: 2 },
        other: { sid: "other-sid", organizationId: 3, acr: "eidas0" },
      },
    };

    setAuthorizedOrganization(session, "client", {
      organizationId: 1,
      acr: "eidas1",
    });

    assert.deepEqual(session.authorizations, {
      client: {
        sid: "sid",
        grantId: "grantId",
        organizationId: 1,
        acr: "eidas1",
      },
      other: { sid: "other-sid", organizationId: 3, acr: "eidas0" },
    });
  });

  it("should create the entry when the session has no authorizations", () => {
    const session: AuthorizationsHolder = {};

    setAuthorizedOrganization(session, "client", { organizationId: 1 });

    assert.deepEqual(session.authorizations, {
      client: { organizationId: 1, acr: undefined },
    });
  });

  it("should reassign the top-level authorizations property", () => {
    const writtenProperties: (string | symbol)[] = [];
    const session = new Proxy<AuthorizationsHolder>(
      { authorizations: { client: { sid: "sid" } } },
      {
        set(target, property, value, receiver) {
          writtenProperties.push(property);
          return Reflect.set(target, property, value, receiver);
        },
      },
    );

    setAuthorizedOrganization(session, "client", {
      organizationId: 1,
      acr: "eidas1",
    });

    assert.deepEqual(writtenProperties, ["authorizations"]);
  });
});

describe("findAuthorizedOrganization", () => {
  const ctx = ctxWithSessions({
    "session-uid": {
      authorizations: { client: { organizationId: 1, acr: "eidas1" } },
    },
  });

  it("should return undefined without token", async () => {
    assert.equal(await findAuthorizedOrganization(ctx, undefined), undefined);
  });

  it("should return undefined without sessionUid", async () => {
    assert.equal(
      await findAuthorizedOrganization(ctx, { clientId: "client" }),
      undefined,
    );
  });

  it("should return undefined when the session is not found", async () => {
    assert.equal(
      await findAuthorizedOrganization(ctx, {
        sessionUid: "unknown-uid",
        clientId: "client",
      }),
      undefined,
    );
  });

  it("should return the organization stored for the token client", async () => {
    assert.deepEqual(
      await findAuthorizedOrganization(ctx, {
        sessionUid: "session-uid",
        clientId: "client",
      }),
      { organizationId: 1, acr: "eidas1" },
    );
  });
});
