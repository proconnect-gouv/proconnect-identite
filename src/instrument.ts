import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { HOST, LOG_LEVEL, NODE_ENV, SENTRY_DSN } from "./config/env";

// Ensure to call this before importing any other modules!
Sentry.init({
  enabled: Boolean(SENTRY_DSN),
  attachStacktrace: true,
  debug: LOG_LEVEL === "debug",
  dsn: SENTRY_DSN,
  environment: NODE_ENV,
  initialScope: { tags: { NODE_ENV, HOST } },
  integrations: [
    nodeProfilingIntegration(),
    Sentry.expressIntegration(),
    Sentry.httpIntegration(),
    Sentry.postgresIntegration(),
  ],
  profilesSampleRate: 0.5,
  tracesSampleRate: 0.2,
});
