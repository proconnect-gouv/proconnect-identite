//

import { InseeApiAuthError } from "#src/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInseeAccessTokenFactory } from "./get-insee-access-token.js";

//

const {
  INSEE_CLIENT_ID,
  INSEE_CLIENT_SECRET,
  INSEE_CLIENT_USERNAME,
  INSEE_CLIENT_PASSWORD,
} = process.env;

//

describe(
  "getInseeAccessTokenFactory",
  {
    skip: ![
      INSEE_CLIENT_ID,
      INSEE_CLIENT_SECRET,
      INSEE_CLIENT_USERNAME,
      INSEE_CLIENT_PASSWORD,
    ].every(Boolean),
  },
  function () {
    it("should return an access token", async () => {
      const getInseeAccessToken = getInseeAccessTokenFactory({
        client_id: INSEE_CLIENT_ID!,
        client_secret: INSEE_CLIENT_SECRET!,
        grant_type: "password",
        username: INSEE_CLIENT_USERNAME!,
        password: INSEE_CLIENT_PASSWORD!,
      });

      const accessToken = await getInseeAccessToken();

      assert.ok(accessToken);
    });

    it("❎ fails with an invalid username", async () => {
      const getInseeAccessToken = getInseeAccessTokenFactory({
        client_id: INSEE_CLIENT_ID!,
        client_secret: INSEE_CLIENT_SECRET!,
        grant_type: "password",
        username: "invalid-username",
        password: INSEE_CLIENT_PASSWORD!,
      });

      await assert.rejects(
        getInseeAccessToken,
        new InseeApiAuthError({
          error: "invalid_grant",
          error_description: "Invalid user credentials",
        }),
      );
    });
  },
);
