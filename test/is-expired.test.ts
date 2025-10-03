import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";
import { isExpired } from "../src/services/is-expired";

describe("isExpired", () => {
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date(2022, 11, 20) });
  });

  const expirationDurationInMinutes = 24 * 60;

  it("should return true when Date is undefined", () => {
    assert.strictEqual(isExpired(null, expirationDurationInMinutes), true);
  });

  it("should return false when Date is about to expire", () => {
    const emittedDate = new Date(2022, 11, 19, 0, 1);

    assert.strictEqual(
      isExpired(emittedDate, expirationDurationInMinutes),
      false,
    );
  });

  it("should return true when Date is expired", () => {
    const emittedDate = new Date(2022, 11, 18, 23, 59);

    assert.strictEqual(
      isExpired(emittedDate, expirationDurationInMinutes),
      true,
    );
  });
});
