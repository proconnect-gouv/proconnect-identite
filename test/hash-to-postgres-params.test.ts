import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashToPostgresParams } from "../src/services/hash-to-postgres-params";

describe("hashToPostgresParams", () => {
  it("should return update params for user", () => {
    const hash = { email: "email@xy.z", encrypted_password: "hash" };
    assert.deepEqual(hashToPostgresParams<typeof hash>(hash), {
      paramsString: "(email, encrypted_password)",
      valuesString: "($1, $2)",
      values: ["email@xy.z", "hash"],
    });
  });
});
