import { captureEvent, getActiveSpan, getIsolationScope } from "@sentry/node";
import { format } from "node:util";
import { z } from "zod";
import { LOG_LEVEL } from "../config/env";

const levels = ["trace", "debug", "info", "warn", "error", "fatal"] as const;
type LogLevelNames = (typeof levels)[number];

export function current_trace_id() {
  return getActiveSpan()?.spanContext().traceId;
}

function write(level: LogLevelNames, fields: Record<string, unknown>) {
  if (levels.indexOf(level) < levels.indexOf(LOG_LEVEL)) return;
  const line = JSON.stringify({
    level,
    ...fields,
    span_id: getActiveSpan()?.spanContext().spanId,
    timestamp: new Date().toISOString(),
    trace_id: current_trace_id(),
  });
  if (levels.indexOf(level) < levels.indexOf("warn")) console.log(line);
  else console.error(line);
}

function exception_fields(exception: Error) {
  const causes = [];
  for (
    let cause: unknown = exception.cause;
    cause !== undefined && causes.length < 10;
    cause = cause instanceof Error ? cause.cause : undefined
  ) {
    causes.push(
      cause instanceof Error
        ? { message: cause.message, type: cause.name }
        : { message: String(cause) },
    );
  }
  return {
    ...(causes.length > 0 ? { "exception.causes": causes } : {}),
    "exception.message": exception.message,
    "exception.stacktrace": exception.stack,
    "exception.type": exception.name,
  };
}

const writeMessage =
  (level: LogLevelNames) =>
  (...args: unknown[]) => {
    const exception = args.find((arg) => arg instanceof Error);
    write(level, {
      ...(exception ? exception_fields(exception) : {}),
      msg: format(...args),
    });
  };

export const logger = {
  debug: writeMessage("debug"),
  error: writeMessage("error"),
  fatal: writeMessage("fatal"),
  info: writeMessage("info"),
  trace: writeMessage("trace"),
  warn: writeMessage("warn"),
};

export function logger_group(...label: any[]) {
  if (["debug", "trace"].includes(LOG_LEVEL)) console.group(...label);
}
export function logger_group_end() {
  if (["debug", "trace"].includes(LOG_LEVEL)) console.groupEnd();
}

type TrackDetails = Record<
  string,
  boolean | Error | null | number | readonly string[] | string | undefined
>;

function detail_value(value: TrackDetails[string]) {
  if (value instanceof z.ZodError) return z.prettifyError(value);
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  return value === undefined ? "undefined" : value;
}

export function track(name: string, details: TrackDetails) {
  captureEvent({ fingerprint: ["track", name], level: "info", message: name });
  write("info", {
    "event.name": name,
    "http.route": getIsolationScope().getScopeData().transactionName,
    ...Object.fromEntries(
      Object.entries(details).map(([key, value]) => [key, detail_value(value)]),
    ),
  });
}
