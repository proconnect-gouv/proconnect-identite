//

import type { paths } from "#openapi";
import {
  RegistreNationalEntreprisesApiAuthError,
  RegistreNationalEntreprisesApiError,
} from "#src/types";
import { AssertionError } from "node:assert";
import createClient, { type ClientOptions } from "openapi-fetch";

//

export function getRegistreNationalEntreprisesAccessTokenFactory(
  body: {
    password: string;
    username: string;
  },
  options: ClientOptions = {},
) {
  return async function getRegistreNationalEntreprisesAccessToken() {
    const client = createClient<paths>({
      baseUrl:
        options.baseUrl ?? "https://registre-national-entreprises.inpi.fr/api",
      ...options,
    });

    const { data, error } = await client.POST("/sso/login", {
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (error) {
      throw new RegistreNationalEntreprisesApiAuthError("Unauthorized", {
        cause: new RegistreNationalEntreprisesApiError(error),
      });
    }
    if (!data.token) {
      throw new RegistreNationalEntreprisesApiAuthError("Token not found", {
        cause: new AssertionError({
          actual: typeof data.token,
          expected: "token",
          operator: "!",
          message: "Token not found",
        }),
      });
    }

    return data.token;
  };
}

export type GetRegistreNationalEntreprisesAccessTokenHandler = ReturnType<
  typeof getRegistreNationalEntreprisesAccessTokenFactory
>;
