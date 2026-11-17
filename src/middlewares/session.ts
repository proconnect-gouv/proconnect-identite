import * as Sentry from "@sentry/node";
import { RedisStore } from "connect-redis";
import session, { type SessionData } from "express-session";
import type { RedisClientType } from "redis";
import {
  FEATURE_USE_SECURE_COOKIES,
  SESSION_COOKIE_SECRET,
  SESSION_MAX_AGE_IN_SECONDS,
} from "../config/env";
import { StoredSessionSchema } from "../managers/session/session-data";
import { jsonParseWithDate } from "../services/json-parse-with-date";
import { logger } from "../services/log";

//

export const createSessionMiddleware = (client: RedisClientType) =>
  session({
    store: new RedisStore({
      client,
      prefix: "mcp:session:",
      serializer: {
        parse: (serializedSession: string) => {
          const result = StoredSessionSchema.safeParse(
            jsonParseWithDate(serializedSession),
          );
          if (result.success) return result.data;
          logger.error(result.error);
          Sentry.captureException(result.error);
          return null as unknown as SessionData;
        },
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
