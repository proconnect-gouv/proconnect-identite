//

import { RegistreNationalEntreprisesApiAuthError } from "#src/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getRegistreNationalEntreprisesAccessTokenFactory } from "./get-rne-access-token.js";

//

const { RNE_API_USERNAME, RNE_API_PASSWORD } = process.env;

//

describe(
  "getInseeAccessTokenFactory",
  {
    skip: ![RNE_API_USERNAME, RNE_API_PASSWORD].every(Boolean),
  },
  function () {
    it("should return an access token", async () => {
      const get_access_token = getRegistreNationalEntreprisesAccessTokenFactory(
        {
          username: RNE_API_USERNAME!,
          password: RNE_API_PASSWORD!,
        },
      );

      const accessToken = await get_access_token();

      assert.ok(accessToken);
    });

    it("❎ fails with an invalid username", async () => {
      const get_access_token = getRegistreNationalEntreprisesAccessTokenFactory(
        {
          username: "invalid-username",
          password: RNE_API_PASSWORD!,
        },
      );

      await assert.rejects(
        get_access_token,
        new RegistreNationalEntreprisesApiAuthError("Unauthorized"),
      );
    });

    it("❎ fails with token not found", async () => {
      const get_access_token = getRegistreNationalEntreprisesAccessTokenFactory(
        {
          username: RNE_API_USERNAME!,
          password: RNE_API_PASSWORD!,
        },
        {
          fetch: async () => Promise.resolve(new Response(JSON.stringify({}))),
        },
      );

      await assert.rejects(
        get_access_token,
        new RegistreNationalEntreprisesApiAuthError("Token not found"),
      );
    });
  },
);
