import assert from "node:assert";
import { describe, it } from "node:test";
import { addQueryParameters } from "./add-query-parameters";

describe("addQueryParameters", () => {
  it("returns the same uri when params are empty", () => {
    const result = addQueryParameters("path", {});
    assert.strictEqual(result, "path");
  });

  it("ignores undefined or falsy values", () => {
    const result = addQueryParameters("path", {
      a: undefined,
      b: "",
      c: "valid",
    });
    assert.strictEqual(result, "path?c=valid");
  });

  it("appends multiple query parameters in order", () => {
    const result = addQueryParameters("path", {
      first: "1",
      second: "2",
    });
    assert.strictEqual(result, "path?first=1&second=2");
  });

  it("URL-encodes keys and values", () => {
    const result = addQueryParameters("path", {
      "spaced key": "value with space",
    });
    assert.strictEqual(result, "path?spaced+key=value+with+space");
  });
});
