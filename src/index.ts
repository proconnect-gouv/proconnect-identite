import * as Sentry from "@sentry/node";
import { RedisStore } from "connect-redis";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import session from "express-session";
import fs from "fs";
import helmet from "helmet";
import { Server } from "http";
import HttpErrors from "http-errors";
import { isNull, omitBy } from "lodash-es";
import morgan from "morgan";
import { inspect } from "node:util";
import Provider, { type ClientMetadata, errors } from "oidc-provider";
import path from "path";
import { ZodError } from "zod";
import {
  ACCESS_LOG_PATH,
  FEATURE_USE_SECURE_COOKIES,
  FEATURE_USE_SECURITY_RESPONSE_HEADERS,
  HOST,
  JWKS,
  NODE_ENV,
  PORT,
  SESSION_COOKIE_SECRET,
  SESSION_MAX_AGE_IN_SECONDS,
} from "./config/env";
import { OidcError } from "./config/errors";
import { oidcProviderConfiguration } from "./config/oidc-provider-configuration";
import { getNewRedisClient } from "./connectors/redis";
import { trustedBrowserMiddleware } from "./managers/browser-authentication";
import { connectionCountMiddleware } from "./middlewares/connection-count";
import { getClients } from "./repositories/oidc-client";
import oidcProviderRepository from "./repositories/redis/oidc-provider";
import { apiRouter } from "./routers/api";
import { interactionRouter } from "./routers/interaction";
import { mainRouter } from "./routers/main";
import { userRouter } from "./routers/user";
import { jsonParseWithDate } from "./services/json-parse-with-date";
import { logger } from "./services/log";
import {
  ejsLayoutMiddlewareFactory,
  renderWithEjsLayout,
} from "./services/renderer";
import { usesAuthHeaders } from "./services/uses-auth-headers";

const app = express();

if (FEATURE_USE_SECURITY_RESPONSE_HEADERS) {
  app.use(
    helmet({
      hsts: false,
      frameguard: false,
    }),
  );

  const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const cspConfig = {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "stats.data.gouv.fr", "*.crisp.chat"],
        connectSrc: [
          "'self'",
          "stats.data.gouv.fr",
          "*.crisp.chat",
          "wss://*.crisp.chat",
        ],
        frameSrc: ["'self'", "proconnect.crisp.help"],
        scriptSrc: ["'self'", "stats.data.gouv.fr", "*.crisp.chat"],
        styleSrc: ["'self'", "*.crisp.chat", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:", "*.crisp.chat"],
        // As for https://github.com/w3c/webappsec-csp/issues/8, the feature is debated
        // and seems not useful for open id provider redirection.
        // We bypass this security for now.
        formAction: ["'self'", "*"],
      },
    };

    helmet.contentSecurityPolicy(cspConfig)(req, res, next);
  };
  app.use(cspMiddleware);
}

// Disable etag globally to avoid triggering invalid csrf token error
// Note that express.static always sends weak ETags.
app.set("etag", false);

let morganOption: morgan.Options<Request, Response> = {
  skip: (req: Request, _res: Response) => req.baseUrl?.startsWith("/dist"),
};
if (ACCESS_LOG_PATH) {
  morganOption.stream = fs.createWriteStream(ACCESS_LOG_PATH, { flags: "a" });
}
const httpLogger = morgan("combined", morganOption);
app.use(httpLogger);

app.set("trust proxy", 1);

const sessionMiddleware =
  // @ts-ignore
  session({
    store: new RedisStore({
      client: getNewRedisClient(),
      prefix: "mcp:session:",
      serializer: {
        parse: jsonParseWithDate,
        stringify: JSON.stringify,
      },
    }),
    name: "session",
    cookie: {
      maxAge: SESSION_MAX_AGE_IN_SECONDS * 1000,
      secure: FEATURE_USE_SECURE_COOKIES,
      sameSite: "lax",
    },
    secret: SESSION_COOKIE_SECRET,
    // future default
    resave: false,
    // future default
    saveUninitialized: false,
  });

// Prevent creation of sessions for API calls on /oauth or /api routes
app.use(function preventSessionCreationMiddleware(req, res, next) {
  if (usesAuthHeaders(req)) {
    return next();
  }
  return sessionMiddleware(req, res, next);
});

app.use(trustedBrowserMiddleware);

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

const clients = await getClients();

// the oidc provider expect provided client attributes to be not null if provided
const clientsWithoutNullProperties = clients.map(
  (oidcClient) => omitBy(oidcClient, isNull) as ClientMetadata,
);

const oidcProvider = new Provider(`${HOST}`, {
  clients: clientsWithoutNullProperties,
  adapter: oidcProviderRepository,
  jwks: JWKS,
  async renderError(ctx, { error, error_description }, err) {
    if (
      !(
        err instanceof errors.InvalidClient ||
        err instanceof errors.InvalidRedirectUri ||
        err instanceof errors.InvalidRequest ||
        err instanceof errors.InvalidRequestUri
      )
    ) {
      logger.error(err);
      Sentry.withScope((scope) => {
        scope.setSDKProcessingMetadata({ request: ctx.request });
        scope.captureException(err);
      });
    }

    ctx.type = "html";
    ctx.body = await renderWithEjsLayout("error", {
      error_code:
        err instanceof errors.OIDCProviderError ? err.statusCode : err,
      error_message: `${error}: ${error_description}`,
    });
  },
  cookies: {
    names: {
      session: "oidc.session",
      interaction: "oidc.interaction",
      resume: "oidc.interaction_resume",
      state: "oidc.state",
    },
    long: {
      overwrite: true,
      signed: true,
      secure: FEATURE_USE_SECURE_COOKIES,
      sameSite: "lax",
    },
    short: {
      overwrite: true,
      signed: true,
      secure: FEATURE_USE_SECURE_COOKIES,
      sameSite: "lax",
    },
    keys: SESSION_COOKIE_SECRET,
  },
  ...oidcProviderConfiguration({
    sessionTtlInSeconds: SESSION_MAX_AGE_IN_SECONDS,
  }),
});
oidcProvider.proxy = true;
oidcProvider.use(connectionCountMiddleware);

app.use(
  "/dist/mail-proconnect.png",
  (req, res, next) => {
    return helmet.crossOriginResourcePolicy({
      policy: "cross-origin",
    })(req, res, next);
  },
  express.static("dist/mail-proconnect.png", {
    maxAge: NODE_ENV === "development" ? undefined : 7 * 24 * 60 * 60 * 1000,
  }),
);
/*
 * `dist` folder is generated by vite.
 * Vite transforms js and css from /assets to /dist,
 * and copies static files from /public to /dist folder.
 * Our express app serves those static files. Vite only takes care of generating files in dev/while building.
 *
 * Do not cache in dev for easier workflow. Otherwise cache for 1 week
 */
app.use(
  "/dist",
  express.static("dist", {
    maxAge: NODE_ENV === "development" ? undefined : 7 * 24 * 60 * 60 * 1000,
  }),
);
app.get("/favicon.ico", function (_req, res, _next) {
  return res.sendFile("favicons/favicon.ico", {
    root: "public",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
});

app.use("/", mainRouter(app));
app.use(
  "/interaction",
  ejsLayoutMiddlewareFactory(app),
  interactionRouter(oidcProvider),
);

app.use("/users", ejsLayoutMiddlewareFactory(app), userRouter());
app.use("/api", apiRouter());

app.use((req, _res, next) => {
  if (req.url === "/.well-known/openid-configuration") {
    req.url = "/oauth/.well-known/openid-configuration";
  }
  next();
});
app.use("/oauth", oidcProvider.callback());

app.use(async (req, res, _next) => {
  res.setHeader("Content-Type", "text/html");
  res.status(404).send(
    await renderWithEjsLayout("not-found-error", {
      pageTitle: "Page introuvable",
      illustration: "connection-lost.svg",
      oidcError: "invalid_request",
      interactionId: req.session?.interactionId,
      sentryTrackingMetaTags: Sentry.getTraceMetaTags(),
    }),
  );
});

// The error handler must be before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.use(function errorHandler(
  err: HttpErrors.HttpError | ZodError | Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(inspect(err, { depth: 3 }));

  if (err instanceof HttpErrors.HttpError) {
    if (err.statusCode === 404) {
      return res.status(404).render("not-found-error", {
        // force not to use dashboard layout in case the error is shown within a dashboard page
        use_dashboard_layout: false,
        illustration: "connection-lost.svg",
        oidcError: "invalid_request",
        interactionId: req.session.interactionId,
      });
    }
    return res.status(err.statusCode || 500).render("error", {
      error_code: err.statusCode || err,
      error_message: err.message,
      // force not to use dashboard layout in case the error is shown within a dashboard page
      use_dashboard_layout: false,
      illustration: "connection-lost.svg",
      oidcError: "server_error",
      interactionId: req.session.interactionId,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).render("error", {
      error_code: 400,
      error_message: err.message,
      // force not to use dashboard layout in case the error is shown within a dashboard page
      use_dashboard_layout: false,
      illustration: "connection-lost.svg",
      oidcError: "invalid_request",
      interactionId: req.session.interactionId,
    });
  }

  if (err instanceof OidcError) {
    return res.status(400).render("error", {
      error_code: err.error,
      error_message: err.error_description,
      // force not to use dashboard layout in case the error is shown within a dashboard page
      use_dashboard_layout: false,
      illustration: "connection-lost.svg",
      oidcError: err.error,
      interactionId: req.session.interactionId,
    });
  }

  return res.status(500).render("error", {
    error_code: err,
    error_message: err.message,
    // force not to use dashboard layout in case the error is shown within a dashboard page
    use_dashboard_layout: false,
    illustration: "connection-lost.svg",
    oidcError: "server_error",
    interactionId: req.session.interactionId,
  });
});

let server: Server | undefined;

try {
  server = app.listen(PORT, () => {
    logger.info(`application is listening on port ${PORT}`);
  });
} catch (err) {
  if (server && server.listening) server.close();
  logger.error(err);
  process.exit(1);
}
