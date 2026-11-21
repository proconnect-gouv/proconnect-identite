//

import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import express, { urlencoded } from "express";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { after } from "node:test";
import MemoryAdapter from "oidc-provider/lib/adapters/memory_adapter.js";
import type { RedisClientType } from "redis";
import { client, migrate } from "./index";

//

await migrate();
const postgres = new PGLiteSocketServer({
  db: client,
  maxConnections: 10,
  port: 0,
});
await postgres.start();
process.env["DATABASE_URL"] =
  `postgres://postgres@${postgres.getServerConn()}/postgres`;

// app modules read DATABASE_URL and open the pool when loaded
const { createOidcProvider } = await import("../src/config/oidc-provider");
const { context } = await import("../src/connectors/context");
const { getDatabaseConnection } = await import("../src/connectors/postgres");
const { issueSessionOrRedirectController } =
  await import("../src/controllers/user/issue-session-or-redirect");
const { postSelectOrganizationMiddleware } =
  await import("../src/controllers/user/select-organization");
const { createAuthenticatedSession } =
  await import("../src/managers/session/authenticated");
const {
  userCanSelectAnOrganizationGuardMiddleware,
  userComplyWithAllRequirementsGuardMiddleware,
} = await import("../src/middlewares/navigation-guards");
const { createSessionMiddleware } = await import("../src/middlewares/session");
const { OidcProviderAdapterForClients } =
  await import("../src/repositories/oidc-provider-adapter-for-clients");
const { interactionRouter } = await import("../src/routers/interaction");

const provider = await createOidcProvider({
  adapter: (name) =>
    name === "Client"
      ? new OidcProviderAdapterForClients()
      : new MemoryAdapter(name),
});

const sessions = new Map<string, string>();
const sessionStoreClient = {
  del: async (keys: string[]) => keys.filter((key) => sessions.delete(key)),
  expire: async () => true,
  get: async (key: string) => sessions.get(key) ?? null,
  set: async (key: string, value: string) => sessions.set(key, value),
};

const app = express()
  .use(
    createSessionMiddleware(sessionStoreClient as unknown as RedisClientType),
  )
  .post("/test/sign-in", urlencoded({ extended: false }), async (req, res) => {
    const user = await context.repository.users.findById(
      Number(req.body.user_id),
    );
    if (!user) return res.sendStatus(404);
    await createAuthenticatedSession(req, res, user, "pwd");
    return res.sendStatus(204);
  })
  .post(
    "/users/select-organization",
    urlencoded({ extended: false }),
    userCanSelectAnOrganizationGuardMiddleware,
    postSelectOrganizationMiddleware,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  )
  .use("/interaction", interactionRouter(provider))
  .use("/oauth", provider.callback());

export const server = app.listen(0);
await once(server, "listening");
export const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

after(async () => {
  server.close();
  await getDatabaseConnection().end();
  await postgres.stop();
  await client.close();
});
