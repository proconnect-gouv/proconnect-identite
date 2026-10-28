import * as Sentry from "@sentry/node";
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { logger } from "./log";

describe("trace_id on log lines", () => {
  const info = mock.method(console, "log", () => {});
  Sentry.init({
    beforeSendTransaction: () => null,
    dsn: "https://public@sentry.invalid/1",
    traceLifecycle: "static",
    tracesSampleRate: 0,
  });

  it("carries the trace of the request it was written in, sampled or not", () => {
    const trace_id = Sentry.startSpan({ name: "GET /users/x" }, (span) => {
      logger.info("inside a request");
      return span.spanContext().traceId;
    });
    const line = JSON.parse(String(info.mock.calls.at(-1)?.arguments[0]));
    assert.equal(line.trace_id, trace_id);
  });

  it("carries none outside a request", () => {
    logger.info("at startup");
    const line = JSON.parse(String(info.mock.calls.at(-1)?.arguments[0]));
    assert.equal("trace_id" in line, false);
  });
});
