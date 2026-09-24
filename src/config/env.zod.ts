import { z } from "zod";

export const connectorEnvSchema = z.object({
  ANNUAIRE_SERVICE_PUBLIC_API_URL: z.url(),
  CRISP_BASE_URL: z.url(),
  CRISP_IDENTIFIER: z.string(),
  CRISP_KEY: z.string(),
  CRISP_MODERATION_TAG: zCoerceArray(),
  CRISP_PLUGIN_URN: z.string(),
  CRISP_RESOLVE_DELAY: z.coerce.number().int().nonnegative(),
  CRISP_USER_NICKNAME: z.string(),
  CRISP_WEBSITE_ID: z.string(),
  DATABASE_URL: z.url(),
  DEBOUNCE_API_KEY: z.string(),
  ENTREPRISE_API_TOKEN: z.string(),
  ENTREPRISE_API_URL: z.url(),
  ENTREPRISE_API_TRACKING_CONTEXT: z.string(),
  ENTREPRISE_API_TRACKING_RECIPIENT: z.string(),
  FRANCECONNECT_CLIENT_ID: z.string(),
  FRANCECONNECT_CLIENT_SECRET: z.string(),
  FRANCECONNECT_ID_TOKEN_SIGNED_RESPONSE_ALG: z.string(),
  FRANCECONNECT_ISSUER: z.url(),
  FRANCECONNECT_SCOPES: zCoerceArray(),
  FRANCECONNECT_VERIFICATION_MAX_AGE_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative(),
  INSEE_API_CLIENT_ID: z.string(),
  INSEE_API_CLIENT_SECRET: z.string(),
  INSEE_API_PASSWORD: z.string(),
  INSEE_API_URL: z.url(),
  INSEE_API_USERNAME: z.string(),
  REDIS_URL: z.url(),
  RNE_API_PASSWORD: z.string(),
  RNE_API_USERNAME: z.string(),
  RNE_API_BASE_URL: z.url(),
  RNE_API_HTTP_CLIENT_TIMEOUT: z.coerce.number().int().nonnegative(),
  SENTRY_DSN: z.string(),
  SMTP_FROM: z.string(),
  SMTP_FROM_ALT: z.string(),
  SMTP_URL: z.url(),
});

export const featureTogglesEnvSchema = z.object({
  FEATURE_AUTHENTICATE_BROWSER: zodTrueFalseBoolean(),
  FEATURE_BYPASS_MODERATION: zodTrueFalseBoolean(),
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE: zodTrueFalseBoolean(),
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE: zodTrueFalseBoolean(),
  FEATURE_DISPLAY_TEST_ENV_WARNING: zodTrueFalseBoolean(),
  FEATURE_LOAD_THIRD_PARTY_TRACKING_SCRIPTS: zodTrueFalseBoolean(),
  FEATURE_MOCK_DEBOUNCE_API: zodTrueFalseBoolean(),
  FEATURE_MOCK_RNE_API: zodTrueFalseBoolean(),
  FEATURE_MOUNT_MOCKED_EXTERNAL_APIS: zodTrueFalseBoolean(),
  FEATURE_PARTIALLY_MOCK_EXTERNAL_API: zodTrueFalseBoolean(),
  FEATURE_RATE_LIMIT_BY_EMAIL: zodTrueFalseBoolean(),
  FEATURE_RATE_LIMIT_BY_IP: zodTrueFalseBoolean(),
  FEATURE_USE_ANNUAIRE_EMAILS: zodTrueFalseBoolean(),
  FEATURE_USE_SECURE_COOKIES: zodTrueFalseBoolean(),
  FEATURE_USE_SECURITY_RESPONSE_HEADERS: zodTrueFalseBoolean(),
});

export const secretEnvSchema = z.object({
  SYMMETRIC_ENCRYPTION_KEY: z.base64({
    error: [
      "The SYMMETRIC_ENCRYPTION_KEY environment variable should be 32 bytes long!",
      "Use crypto.randomBytes(32).toString('base64') to generate one.",
    ].join(" "),
  }),
  SESSION_COOKIE_SECRET: zCoerceArray(),
  JWKS: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.object({ keys: z.array(z.any()) }),
  ),
});

export const paramsEnvSchema = z.object({
  ACCESS_LOG_PATH: z.string().optional(),
  API_IP_RATE_LIMITER_POINTS_PER_MINUTE: z.coerce.number().int().nonnegative(),
  APPLICATION_NAME: z.string(),
  APP_IP_RATE_LIMITER_POINTS_PER_MINUTE: z.coerce.number().int().nonnegative(), // 1 day in minutes
  CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative(),
  DEPLOY_ENV: z.enum(["localhost", "preview", "production", "sandbox"]), // 55 seconds in milliseconds;
  HOST: z.url(),
  HTTP_CLIENT_TIMEOUT: z.coerce.number().int().nonnegative(), // 1 hour in minutes
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]), // 3 months in minutes
  MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative(),
  MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative(), // 20 minutes in seconds,
  MAX_SUGGESTED_ORGANIZATIONS: z.coerce.number().int().nonnegative(),
  MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative(),
  NODE_ENV: z.enum(["production", "development", "test", "e2e"]),
  OFFICIAL_CONTACT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_DURATION_IN_MINUTES:
    z.coerce.number().int().nonnegative(),
  PORT: z.coerce.number().int().nonnegative(),
  RECENT_LOGIN_INTERVAL_IN_SECONDS: z.coerce.number().int().nonnegative(), // 15 minutes
  RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative(),
  SESSION_MAX_AGE_IN_SECONDS: z.coerce.number().int().nonnegative(), // 1 day in seconds
  SMTP_FROM_ALT_RATIO_PERCENT: z.coerce.number().min(0).max(100),
  TEST_CONTACT_EMAIL: z.string(),
  TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative(),
  USE_SMTP_FROM_ALT_FOR_DOMAINS: zCoerceArray(),
  VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative(),
});

export const envSchema = z
  .object({})
  .extend(connectorEnvSchema.shape)
  .extend(featureTogglesEnvSchema.shape)
  .extend(secretEnvSchema.shape)
  .extend(paramsEnvSchema.shape);

//

export function zodTrueFalseBoolean() {
  return z.enum(["True", "False"]).transform((v: string) => v === "True");
}

export function zCoerceArray() {
  return z
    .string()
    .transform((value) => (value === "" ? [] : value.split(",")));
}
