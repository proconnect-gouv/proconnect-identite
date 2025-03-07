import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { jsonParseWithDate } from "../src/services/json-parse-with-date";

describe("jsonParseWithDate", () => {
  it("should parse Date from json iso string", () => {
    const string = '{"a":"2023-12-01T00:00:00.000Z"}';

    assert.deepEqual(jsonParseWithDate(string), {
      a: new Date("2023-12-01"),
    });
  });

  it("should not infer on other types", () => {
    const string = '{"a":"a", "b": 2, "c": null}';

    assert.deepEqual(jsonParseWithDate(string), {
      a: "a",
      b: 2,
      c: null,
    });
  });
});
