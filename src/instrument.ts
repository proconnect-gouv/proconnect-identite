import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import packageJson from "../package.json" with { type: "json" };
import {
  HOST,
  LOG_LEVEL,
  NODE_ENV,
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
} from "./config/env";

// Ensure to call this before importing any other modules!
// SDK 11 requires self-hosted Sentry >= 26.4.2; we run 24.8.0, so stay on the
// 10.x line (supported against >= 24.4.2) until the backend is upgraded.
Sentry.init({
  enabled: Boolean(SENTRY_DSN),
  attachStacktrace: true,
  dataCollection: {
    cookies: false,
    databaseQueryData: false,
    httpBodies: [],
    httpHeaders: {
      request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
      response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    },
    urlQueryParams: {
      deny: ["code", "forwarded", "-ip", "remote-", "state", "via", "-user"],
    },
    userInfo: false,
  },
  debug: LOG_LEVEL === "debug",
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  release: packageJson.version,
  initialScope: { tags: { NODE_ENV, HOST } },
  integrations: [
    nodeProfilingIntegration(),
    Sentry.expressIntegration(),
    // `spans` gates the status filter: without it 3xx and 401/403
    // transactions are dropped, hiding every automatic redirect.
    Sentry.httpIntegration({
      dropSpansForIncomingRequestStatusCodes: [404],
      spans: true,
    }),
    Sentry.postgresIntegration(),
  ],
  // Continuous profiling (profile_chunk) postdates self-hosted 24.8.0; the
  // legacy span profiling attaches profiles to transactions instead.
  profilesSampleRate: SENTRY_ENVIRONMENT === "localhost" ? 1 : 0.5,
  traceLifecycle: "static",
  tracesSampleRate: SENTRY_ENVIRONMENT === "localhost" ? 1 : 0.2,
});
