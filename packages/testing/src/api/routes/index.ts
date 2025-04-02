//

import { Hono, type Env } from "hono";
import { TestingEntrepriseApiRouter } from "./entreprise.api.gouv.fr/index.js";
import {
  TestingOidcProviderRouter,
  type OidcProviderVariables,
} from "./oidc-provider/index.js";
import {
  TestingOidcFranceConnectRouter,
  type FranceConnectBindings,
} from "./oidc.franceconnect.gouv.fr/index.js";

//

export type TestingBindings = FranceConnectBindings;
export type TestingVariables = OidcProviderVariables;
export interface TestingContextVariableMap extends Env {
  Bindings: TestingBindings;
  Variables: TestingVariables;
}

export const router = new Hono<TestingContextVariableMap>()
  .route("/entreprise.api.gouv.fr", TestingEntrepriseApiRouter)
  .route("/oidc-provider", TestingOidcProviderRouter)
  .route("/oidc.franceconnect.gouv.fr", TestingOidcFranceConnectRouter);
