//

import assert from "assert/strict";
import { describe, it } from "node:test";
import { singleValidationFactory } from "./single-validation.js";

//

const { DEBOUNCE_API_KEY } = process.env;
const singleValidation = singleValidationFactory(DEBOUNCE_API_KEY ?? "");

//

describe(
  "singleValidationFactory",
  { skip: DEBOUNCE_API_KEY === undefined },
  () => {
    it("should return a valid response", async function () {
      const response = await singleValidation("test@test.com");
      assert.partialDeepStrictEqual(response, {
        code: "3",
        did_you_mean: "test@toke.com",
        email: "test@test.com",
        free_email: "true",
        reason: "Disposable, Role",
        result: "Invalid",
        role: "true",
        send_transactional: "0",
      });
    });
  },
);
