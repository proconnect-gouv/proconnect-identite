import log, { type LogLevelNames } from "console-log-level";
import moment from "moment";
import { LOG_LEVEL } from "../config/env";

const getLogLevelName = (level: string): LogLevelNames => {
  const levels: LogLevelNames[] = [
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
  ];
  if (levels.includes(level as LogLevelNames)) {
    return level as LogLevelNames;
  }

  return "info";
};

// Apache Common Log Format
function formatDateNowApacheCommon(): string {
  return moment().format("[[]DD/MMM/YYYY:HH:mm:ss ZZ[]]");
}

export const logger = log({
  prefix: formatDateNowApacheCommon,
  level: getLogLevelName(LOG_LEVEL),
});

export function logger_group(...label: any[]) {
  if (["debug", "trace"].includes(LOG_LEVEL)) console.group(...label);
}
export function logger_group_end() {
  if (["debug", "trace"].includes(LOG_LEVEL)) console.groupEnd();
}
