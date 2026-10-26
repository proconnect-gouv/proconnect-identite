import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import packageJson from "../package.json" with { type: "json" };
import { HOST, LOG_LEVEL, NODE_ENV, SENTRY_DSN } from "./config/env";

// Ensure to call this before importing any other modules!
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
    urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    userInfo: false,
  },
  debug: LOG_LEVEL === "debug",
  dsn: SENTRY_DSN,
  environment: NODE_ENV,
  release: packageJson.version,
  initialScope: { tags: { NODE_ENV, HOST } },
  integrations: [
    nodeProfilingIntegration(),
    Sentry.expressIntegration(),
    Sentry.httpIntegration(),
    Sentry.postgresIntegration(),
  ],
  profileLifecycle: "trace",
  profileSessionSampleRate: 0.5,
  traceLifecycle: "static",
  tracesSampleRate: 0.2,
});
