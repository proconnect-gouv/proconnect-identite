import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";
import { formatDate } from "./date-format";

describe("formatDate", () => {
  before(() =>
    mock.timers.enable({
      apis: ["Date"],
      now: new Date("4444-04-04T04:44:44.444Z"),
    }),
  );
  it("should format a date", () => {
    const date = new Date("2022-01-01");
    const formattedDate = formatDate(date);
    assert.equal(formattedDate, "01/01/2022");
  });
  it("should format a recent date", () => {
    const date = new Date();
    const formattedDate = formatDate(date);
    assert.equal(formattedDate, "Aujourd’hui à 05:44");
  });
  it("should format a yesterday date", () => {
    const date = new Date("4444-04-03T04:44:44.444Z");
    const formattedDate = formatDate(date);
    assert.equal(formattedDate, "Hier à 05:44");
  });
});
