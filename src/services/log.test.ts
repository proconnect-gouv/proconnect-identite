import type { ErrorEvent, Event } from "@sentry/node";
import * as Sentry from "@sentry/node";
import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { z } from "zod";
import { logger, track } from "./log";

const error = mock.method(console, "error", () => {});
const info = mock.method(console, "log", () => {});

describe("logger", () => {
  afterEach(() => {
    error.mock.resetCalls();
    info.mock.resetCalls();
  });

  const lines = (method: typeof info) =>
    method.mock.calls.map(({ arguments: [line] }) => JSON.parse(String(line)));

  it("writes the formatted message as one JSON line", () => {
    logger.info(`application is listening on port ${3000}`);
    assert.deepEqual(
      lines(info).map(({ level, msg }) => ({ level, msg })),
      [{ level: "info", msg: "application is listening on port 3000" }],
    );
  });

  it("keeps a multi-line error on a single line", () => {
    logger.error(new Error("boom"));
    assert.equal(error.mock.callCount(), 1);
    assert.equal(
      String(error.mock.calls[0]?.arguments[0]).includes("\n"),
      false,
    );
    assert.match(lines(error)[0].msg, /^Error: boom\n {4}at /);
  });

  it("adds the exception fields with its cause chain", () => {
    const failure = new Error("Error from Debounce API", {
      cause: new TypeError("fetch failed", { cause: "ENOTFOUND" }),
    });
    logger.error(failure);
    const [line] = lines(error);
    assert.deepEqual(
      {
        causes: line["exception.causes"],
        message: line["exception.message"],
        stacktrace: line["exception.stacktrace"],
        type: line["exception.type"],
      },
      {
        causes: [
          { message: "fetch failed", type: "TypeError" },
          { message: "ENOTFOUND" },
        ],
        message: "Error from Debounce API",
        stacktrace: failure.stack,
        type: "Error",
      },
    );
  });

  it("drops trace lines below the configured LOG_LEVEL", () => {
    logger.trace("hidden at the debug and info levels");
    assert.equal(info.mock.callCount(), 0);
  });
});

describe("track", () => {
  const issues: ErrorEvent[] = [];
  const transactions: Event[] = [];
  Sentry.init({
    beforeSend: (event) => {
      issues.push(event);
      return null;
    },
    beforeSendTransaction: (event) => {
      transactions.push(event);
      return null;
    },
    dsn: "https://public@sentry.invalid/1",
    traceLifecycle: "static",
    tracesSampleRate: 1,
  });

  it("writes one event record with its name and details in its request's trace, and sends one Sentry event named after it", async () => {
    const request = Sentry.startSpan(
      { forceTransaction: true, name: "GET /users/join-organization" },
      (span) => {
        track("organization.page_query.invalid", {
          client_id: undefined,
          error: new TypeError("fetch failed"),
          query: z
            .object({ siret: z.string().length(14) })
            .safeParse({ siret: "123" }).error,
          siret: "21340126800130",
        });
        return span.spanContext();
      },
    );
    await Sentry.flush(1_000);
    const line = JSON.parse(String(info.mock.calls.at(-1)?.arguments[0]));
    assert.deepEqual(
      {
        client_id: line.client_id,
        error: line.error,
        "event.name": line["event.name"],
        issues: issues.map(({ fingerprint, level, message }) => ({
          fingerprint,
          level,
          message,
        })),
        query: line.query,
        request_spans: transactions.at(-1)?.spans?.length,
        siret: line.siret,
        span_id: line.span_id,
        trace_id: line.trace_id,
      },
      {
        client_id: "undefined",
        error: "TypeError: fetch failed",
        "event.name": "organization.page_query.invalid",
        issues: [
          {
            fingerprint: ["track", "organization.page_query.invalid"],
            level: "info",
            message: "organization.page_query.invalid",
          },
        ],
        query:
          "✖ Too small: expected string to have exactly 14 characters\n  → at siret",
        request_spans: 0,
        siret: "21340126800130",
        span_id: request.spanId,
        trace_id: request.traceId,
      },
    );
  });
});
