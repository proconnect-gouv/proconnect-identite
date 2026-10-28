import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { logger } from "./log";

describe("logger", () => {
  const error = mock.method(console, "error", () => {});
  const info = mock.method(console, "log", () => {});

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
