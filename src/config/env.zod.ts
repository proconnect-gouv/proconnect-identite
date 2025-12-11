import { randomBytes } from "node:crypto";
import { z } from "zod";
import { create_jwks } from "./jwks";

export const connectorEnvSchema = z.object({
  API_AUTH_PASSWORD: z.string().default("admin"),
  API_AUTH_USERNAME: z.string().default("admin"),
  CRISP_BASE_URL: z.string().url().default("https://api.crisp.chat"),
  CRISP_IDENTIFIER: z.string().default(""),
  CRISP_KEY: z.string().default(""),
  CRISP_MODERATION_TAG: zCoerceArray().default(["identite", "moderation"]),
  CRISP_PLUGIN_URN: z.string().default(""),
  CRISP_RESOLVE_DELAY: z.coerce.number().int().nonnegative().default(1_000), // 1 second
  CRISP_USER_NICKNAME: z.string().default("ProConnect"),
  CRISP_WEBSITE_ID: z.string().default(""),
  DATABASE_URL: z.string().url(),
  DEBOUNCE_API_KEY: z.string().default(""),
  ENTREPRISE_API_TOKEN: z.string().default("🎭 Mocked Entreprise Api Token"),
  ENTREPRISE_API_URL: z.string().url(),
  ENTREPRISE_API_TRACKING_CONTEXT: z.string().default("ProConnect Identité"),
  ENTREPRISE_API_TRACKING_RECIPIENT: z.string().default("13002526500013"),
  FRANCECONNECT_CLIENT_ID: z
    .string()
    .default("🎭 Mocked FranceConnect Client ID"),
  FRANCECONNECT_CLIENT_SECRET: z
    .string()
    .default("🎭 Mocked FranceConnect Client Secret"),
  FRANCECONNECT_ID_TOKEN_SIGNED_RESPONSE_ALG: z.string().default("ES256"),
  FRANCECONNECT_ISSUER: z.string().url(),
  FRANCECONNECT_SCOPES: zCoerceArray().default([
    "birthcountry",
    "birthplace",
    "birthdate",
    "family_name",
    "gender",
    "given_name",
    "openid",
    "preferred_username",
  ]),
  FRANCECONNECT_VERIFICATION_MAX_AGE_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(3 * 30 * 24 * 60), // 3 months in minutes
  INSEE_API_CLIENT_ID: z.string().default("🎭 Mocked Insee API Client ID"),
  INSEE_API_CLIENT_SECRET: z
    .string()
    .default("🎭 Mocked Insee API Client Secret"),
  INSEE_API_PASSWORD: z.string().default("🎭 Mocked Insee API Password"),
  INSEE_API_URL: z
    .string()
    .url()
    .default("https://api.insee.fr/api-sirene/prive/3.11"),
  INSEE_API_USERNAME: z.string().default("🎭 Mocked Insee API Username"),
  REDIS_URL: z.string().url().default("redis://:@127.0.0.1:6379"),
  RNE_API_PASSWORD: z.string().default("🎭 Mocked RNE API Password"),
  RNE_API_USERNAME: z.string().default("🎭 Mocked RNE API Username"),
  RNE_API_HTTP_CLIENT_TIMEOUT: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(1_000 * 3), // 3 seconds in milliseconds;
  SENTRY_DSN: z.string().default(""),
  SMTP_FROM: z
    .string()
    .default("nepasrepondre@email.moncomptepro.beta.gouv.fr"),
  SMTP_URL: z.string(),
});

export const featureTogglesEnvSchema = z.object({
  FEATURE_ALWAYS_RETURN_EIDAS1_FOR_ACR: zodTrueFalseBoolean().default(false),
  FEATURE_AUTHENTICATE_BROWSER: zodTrueFalseBoolean().default(false),
  FEATURE_BYPASS_MODERATION: zodTrueFalseBoolean().default(false),
  FEATURE_CHECK_EMAIL_DELIVERABILITY: zodTrueFalseBoolean().default(false),
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE:
    zodTrueFalseBoolean().default(false),
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE:
    zodTrueFalseBoolean().default(true),
  FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED: zodTrueFalseBoolean().default(false),
  FEATURE_DISPLAY_TEST_ENV_WARNING: zodTrueFalseBoolean().default(false),
  FEATURE_FRANCECONNECT_CONNECTION: zodTrueFalseBoolean().default(false),
  FEATURE_PARTIALLY_MOCK_EXTERNAL_API: zodTrueFalseBoolean().default(true),
  FEATURE_RATE_LIMIT_BY_EMAIL: zodTrueFalseBoolean().default(false),
  FEATURE_RATE_LIMIT_BY_IP: zodTrueFalseBoolean().default(false),
  FEATURE_USE_ANNUAIRE_EMAILS: zodTrueFalseBoolean().default(false),
  FEATURE_USE_SECURE_COOKIES: zodTrueFalseBoolean().default(false),
  FEATURE_USE_SECURITY_RESPONSE_HEADERS: zodTrueFalseBoolean().default(false),
});

export const secretEnvSchema = z.object({
  SYMMETRIC_ENCRYPTION_KEY: z
    .base64({
      error: [
        "The SYMMETRIC_ENCRYPTION_KEY environment variable should be 32 bytes long!",
        "Use crypto.randomBytes(32).toString('base64') to generate one.",
      ].join(" "),
    })
    .default(randomBytes(32).toString("base64")),
  SESSION_COOKIE_SECRET: zCoerceArray().default([
    randomBytes(32).toString("base64"),
  ]),
  JWKS: z
    .preprocess(
      (val) => (typeof val === "string" ? JSON.parse(val) : val),
      z.object({ keys: z.array(z.any()) }),
    )
    .default(await create_jwks()),
});

export const paramsEnvSchema = z.object({
  ACCESS_LOG_PATH: z.string().optional(),
  ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT: z
    .string()
    .default("https://proconnect.gouv.fr/assurance/certification-dirigeant"),
  ACR_VALUE_FOR_IAL1_AAL1: z
    .string()
    .default("https://proconnect.gouv.fr/assurance/self-asserted"),
  ACR_VALUE_FOR_IAL1_AAL2: z
    .string()
    .default("https://proconnect.gouv.fr/assurance/self-asserted-2fa"),
  ACR_VALUE_FOR_IAL2_AAL1: z
    .string()
    .default("https://proconnect.gouv.fr/assurance/consistency-checked"),
  ACR_VALUE_FOR_IAL2_AAL2: z
    .string()
    .default("https://proconnect.gouv.fr/assurance/consistency-checked-2fa"),
  ACR_VALUE_FOR_IAL3_AAL1: z
    .string()
    .default("https://proconnect.gouv.fr/assurance/certification-dirigeant"),
  ACR_VALUE_FOR_IAL3_AAL2: z
    .string()
    .default(
      "https://proconnect.gouv.fr/assurance/certification-dirigeant-2fa",
    ),
  CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(1 * 24 * 60), // 1 day in minutes
  DEPLOY_ENV: z
    .enum(["localhost", "preview", "production", "sandbox"])
    .default("localhost"),
  DIRTY_DS_REDIRECTION_URL: z
    .string()
    .url()
    .optional()
    .default(
      "https://www.demarches-simplifiees.fr/agent_connect/logout_from_mcp",
    ),
  HTTP_CLIENT_TIMEOUT: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(55 * 1_000), // 55 seconds in milliseconds;
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(60), // 1 hour in minutes
  MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(3 * 30 * 24 * 60), // 3 months in minutes
  MAX_SUGGESTED_ORGANIZATIONS: z.coerce.number().int().nonnegative().default(3),
  MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(20 * 60), // 20 minutes in seconds,
  HOST: z.string().url().default("http://localhost:3000"),
  APPLICATION_NAME: z.string().default("ProConnect"),
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  PORT: z.coerce.number().int().nonnegative().default(3000),
  RECENT_LOGIN_INTERVAL_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(15 * 60), // 15 minutes
  RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(60), // 1 hour in minutes
  SESSION_MAX_AGE_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(1 * 24 * 60 * 60), // 1 day in seconds
  TEST_CONTACT_EMAIL: z.string().default("mairie@yopmail.com"),
  TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(3 * 30 * 24 * 60 * 60), // 3 months in seconds
  VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(60), // 1 hour in minutes
});

export const envSchema = z
  .object({})
  .merge(connectorEnvSchema)
  .merge(featureTogglesEnvSchema)
  .merge(secretEnvSchema)
  .merge(paramsEnvSchema);

//

export function zodTrueFalseBoolean() {
  return z.enum(["True", "False"]).transform((v: string) => v === "True");
}

export function zCoerceArray() {
  return z
    .string()
    .transform((value) => (value === "" ? [] : value.split(",")));
}
