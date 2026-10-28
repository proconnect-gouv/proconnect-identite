import { captureEvent, getIsolationScope } from "@sentry/node";
import { format } from "node:util";
import { LOG_LEVEL } from "../config/env";

const levels = ["trace", "debug", "info", "warn", "error", "fatal"] as const;
type LogLevelNames = (typeof levels)[number];

function write(level: LogLevelNames, fields: Record<string, unknown>) {
  if (levels.indexOf(level) < levels.indexOf(LOG_LEVEL)) return;
  const line = JSON.stringify({
    level,
    ...fields,
    timestamp: new Date().toISOString(),
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

export function log_event(name: string, details: Record<string, unknown>) {
  write("info", {
    event: name,
    "http.route": getIsolationScope().getScopeData().transactionName,
    ...details,
  });
}

export function track(name: string, details: Record<string, unknown>) {
  captureEvent({ fingerprint: ["track", name], level: "info", message: name });
  log_event(name, details);
}
