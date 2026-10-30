//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { createContext } from "@proconnect-gouv/proconnect.identite/connectors";
import { drizzle } from "drizzle-orm/node-postgres";
import { instrument } from "../services/log";
import { ApiEntrepriseClient } from "./api-entreprise";
import { ApiInseeClient } from "./api-insee";
import { ApiRegistreNationalEntreprisesClient } from "./api-rne";
import { getDatabaseConnection } from "./postgres";

//

const contextUntraced = createContext({
  api_entreprise_client: ApiEntrepriseClient,
  api_insee_client: ApiInseeClient,
  api_registre_national_entreprises_client:
    ApiRegistreNationalEntreprisesClient,
  pg: getDatabaseConnection(),
});

export const db = drizzle(getDatabaseConnection(), { schema });

export const context: typeof contextUntraced = {
  client: contextUntraced.client,
  repository: {
    authenticators: instrument(
      "identite.repository.authenticators",
      contextUntraced.repository.authenticators,
    ),
    email_deliverability_whitelist: instrument(
      "identite.repository.email_deliverability_whitelist",
      contextUntraced.repository.email_deliverability_whitelist,
    ),
    email_domains: instrument(
      "identite.repository.email_domains",
      contextUntraced.repository.email_domains,
    ),
    franceconnect_userinfo: instrument(
      "identite.repository.franceconnect_userinfo",
      contextUntraced.repository.franceconnect_userinfo,
    ),
    moderations: instrument(
      "identite.repository.moderations",
      contextUntraced.repository.moderations,
    ),
    official_contact_email_verifications: instrument(
      "identite.repository.official_contact_email_verifications",
      contextUntraced.repository.official_contact_email_verifications,
    ),
    oidc_clients: instrument(
      "identite.repository.oidc_clients",
      contextUntraced.repository.oidc_clients,
    ),
    organizations: instrument(
      "identite.repository.organizations",
      contextUntraced.repository.organizations,
    ),
    recovery_words: instrument(
      "identite.repository.recovery_words",
      contextUntraced.repository.recovery_words,
    ),
    users: instrument(
      "identite.repository.users",
      contextUntraced.repository.users,
    ),
    users_organizations: instrument(
      "identite.repository.users_organizations",
      contextUntraced.repository.users_organizations,
    ),
  },
};

const runtimeUntraced = createIdentiteRuntime({
  app: "proconnect-identite",
  db,
});

export const runtime: typeof runtimeUntraced = {
  as(actor) {
    return instrument("identite.runtime", runtimeUntraced.as(actor));
  },
};
