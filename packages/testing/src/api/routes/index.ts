//

import { Hono } from "hono";
import { TestingEntrepriseApiRouter } from "./entreprise.api.gouv.fr/index.js";
import {
  TestingOidcFranceConnectRouter,
  type FranceConnectBindings,
} from "./oidc.franceconnect.gouv.fr/index.js";

//

export type TestingBindings = {
  log: typeof console.log;
} & FranceConnectBindings;
export const router = new Hono<{ Bindings: TestingBindings }>()
  .get("/healthz", ({ text }) => text("ok"))
  .route("/entreprise.api.gouv.fr", TestingEntrepriseApiRouter)
  .route("/oidc.franceconnect.gouv.fr", TestingOidcFranceConnectRouter);
