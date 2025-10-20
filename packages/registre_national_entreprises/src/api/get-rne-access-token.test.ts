//

import { RegistreNationalEntreprisesApiAuthError } from "#src/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getRegistreNationalEntreprisesAccessTokenFactory } from "./get-rne-access-token.js";

//

const { RNE_CLIENT_USERNAME, RNE_CLIENT_PASSWORD } = process.env;

//

describe(
  "getInseeAccessTokenFactory",
  {
    skip: ![RNE_CLIENT_USERNAME, RNE_CLIENT_PASSWORD].every(Boolean),
  },
  function () {
    it("should return an access token", async () => {
      const get_access_token = getRegistreNationalEntreprisesAccessTokenFactory(
        {
          username: RNE_CLIENT_USERNAME!,
          password: RNE_CLIENT_PASSWORD!,
        },
      );

      const accessToken = await get_access_token();

      assert.ok(accessToken);
    });

    it("❎ fails with an invalid username", async () => {
      const get_access_token = getRegistreNationalEntreprisesAccessTokenFactory(
        {
          username: "invalid-username",
          password: RNE_CLIENT_PASSWORD!,
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
          username: RNE_CLIENT_USERNAME!,
          password: RNE_CLIENT_PASSWORD!,
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
