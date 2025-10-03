import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";
import epochTime from "../src/services/epoch-time";

describe("epochTime", () => {
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("2023-12-01") });
  });

  it("should return current date in epoch format", () => {
    assert.strictEqual(epochTime(), 1701388800);
  });

  it("should return a date in epoch format", () => {
    const emittedDate = new Date("2023-12-01T00:01:00.000Z");

    assert.strictEqual(epochTime(emittedDate), 1701388860);
  });
});
