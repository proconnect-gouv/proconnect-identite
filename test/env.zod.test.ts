//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultJWKS } from "../src/config/default-jwks";
import { envSchema } from "../src/config/env.zod";

//

describe("env.zod", () => {
  it("default sample env", () => {
    const sample_env = {
      DATABASE_URL:
        "postgres://proconnect-identite:proconnect-identite@127.0.0.1:5432/proconnect-identite",
      ENTREPRISE_API_TOKEN: "ENTREPRISE_API_TOKEN",
      FRANCECONNECT_ISSUER:
        "http://localhost:3000/___testing___/oidc.franceconnect.gouv.fr/api/v2",
      SMTP_URL: "smtp://localhost:1025",
      SESSION_COOKIE_SECRET: "proconnectsecret,identitesecret",
    };

    const env = envSchema.parse(sample_env);

    assert.deepEqual(env, {
      ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT:
        "https://proconnect.gouv.fr/assurance/certification-dirigeant",
      ACR_VALUE_FOR_IAL1_AAL1:
        "https://proconnect.gouv.fr/assurance/self-asserted",
      ACR_VALUE_FOR_IAL1_AAL2:
        "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
      ACR_VALUE_FOR_IAL2_AAL1:
        "https://proconnect.gouv.fr/assurance/consistency-checked",
      ACR_VALUE_FOR_IAL2_AAL2:
        "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
      ACR_VALUE_FOR_IAL3_AAL1:
        "https://proconnect.gouv.fr/assurance/certification-dirigeant",
      ACR_VALUE_FOR_IAL3_AAL2:
        "https://proconnect.gouv.fr/assurance/certification-dirigeant-2fa",
      API_AUTH_PASSWORD: "admin",
      API_AUTH_USERNAME: "admin",
      CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES: 1440,
      CRISP_BASE_URL: "https://api.crisp.chat",
      CRISP_IDENTIFIER: "",
      CRISP_KEY: "",
      CRISP_MODERATION_TAG: ["identite", "moderation"],
      CRISP_PLUGIN_URN: "",
      CRISP_RESOLVE_DELAY: 1000,
      CRISP_USER_NICKNAME: "ProConnect",
      CRISP_WEBSITE_ID: "",
      DATABASE_URL:
        "postgres://proconnect-identite:proconnect-identite@127.0.0.1:5432/proconnect-identite",
      DEBOUNCE_API_KEY: "",
      DEPLOY_ENV: "localhost",
      DIRTY_DS_REDIRECTION_URL:
        "https://www.demarches-simplifiees.fr/agent_connect/logout_from_mcp",
      EMAIL_DELIVERABILITY_WHITELIST: [],
      ENTREPRISE_API_TOKEN: "ENTREPRISE_API_TOKEN",
      ENTREPRISE_API_TRACKING_CONTEXT: "ProConnect Identité",
      ENTREPRISE_API_TRACKING_RECIPIENT: "13002526500013",
      ENTREPRISE_API_URL: "https://staging.entreprise.api.gouv.fr",
      FEATURE_ALWAYS_RETURN_EIDAS1_FOR_ACR: false,
      FEATURE_AUTHENTICATE_BROWSER: false,
      FEATURE_CHECK_EMAIL_DELIVERABILITY: false,
      FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE: false,
      FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE: true,
      FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED: false,
      FEATURE_DISPLAY_TEST_ENV_WARNING: false,
      FEATURE_FRANCECONNECT_CONNECTION: false,
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API: true,
      FEATURE_BYPASS_MODERATION: false,
      FEATURE_RATE_LIMIT_BY_EMAIL: false,
      FEATURE_RATE_LIMIT_BY_IP: false,
      FEATURE_USE_ANNUAIRE_EMAILS: false,
      FEATURE_USE_SECURE_COOKIES: false,
      FEATURE_USE_SECURITY_RESPONSE_HEADERS: false,
      FRANCECONNECT_CLIENT_ID: "🎭 Mocked FranceConnect Client ID",
      FRANCECONNECT_CLIENT_SECRET: "🎭 Mocked FranceConnect Client Secret",
      FRANCECONNECT_ID_TOKEN_SIGNED_RESPONSE_ALG: "ES256",
      FRANCECONNECT_ISSUER:
        "http://localhost:3000/___testing___/oidc.franceconnect.gouv.fr/api/v2",
      FRANCECONNECT_SCOPES: [
        "birthplace",
        "birthdate",
        "family_name",
        "gender",
        "given_name",
        "openid",
        "preferred_username",
      ],
      FRANCECONNECT_VERIFICATION_MAX_AGE_IN_MINUTES: 129600,
      HTTP_CLIENT_TIMEOUT: 55000,
      INSEE_API_CLIENT_ID: "🎭 Mocked Insee API Client ID",
      INSEE_API_CLIENT_SECRET: "🎭 Mocked Insee API Client Secret",
      INSEE_API_PASSWORD: "🎭 Mocked Insee API Password",
      INSEE_API_URL: "https://api.insee.fr/api-sirene/prive/3.11",
      INSEE_API_USERNAME: "🎭 Mocked Insee API Username",
      JWKS: defaultJWKS,
      LOG_LEVEL: "info",
      MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES: 60,
      MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES: 129600,
      MAX_SUGGESTED_ORGANIZATIONS: 3,
      MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS: 1200,
      HOST: "http://localhost:3000",
      APPLICATION_NAME: "ProConnect",
      NODE_ENV: "development",
      PORT: 3000,
      RECENT_LOGIN_INTERVAL_IN_SECONDS: 900,
      REDIS_URL: "redis://:@127.0.0.1:6379",
      RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES: 60,
      SENTRY_DSN: "",
      SESSION_COOKIE_SECRET: ["proconnectsecret", "identitesecret"],
      SESSION_MAX_AGE_IN_SECONDS: 86400,
      SMTP_FROM: "nepasrepondre@email.moncomptepro.beta.gouv.fr",
      SMTP_URL: "smtp://localhost:1025",
      SYMMETRIC_ENCRYPTION_KEY: "aTrueRandom32BytesLongBase64EncodedStringAA=",
      TEST_CONTACT_EMAIL: "mairie@yopmail.com",
      TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS: 7776000,
      VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES: 60,
    });
  });
});
