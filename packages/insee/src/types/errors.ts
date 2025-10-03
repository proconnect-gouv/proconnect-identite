//

import type { components } from "#openapi";
import type { components as auth_components } from "#openapi/auth";

//

export type OpenApiAuthError = auth_components["schemas"]["Error"];
export type OpenApiError = components["schemas"]["ReponseErreur"];

//

export class InseeApiAuthError extends Error {
  constructor(
    public issue: OpenApiAuthError = {
      error: "Unknown",
      error_description: "Unknown",
    },
    options?: { cause?: Error } | undefined,
  ) {
    super(`${issue.error}: ${issue.error_description}`, options);
    this.name = "InseeApiAuthError";
  }
}

export class InseeApiError extends Error {
  constructor(
    public issue: OpenApiError,
    options?: { cause?: Error } | undefined,
  ) {
    super(
      issue.header ? `${issue.header?.statut}: ${issue.header.message}` : "",
      options,
    );
    this.name = "InseeApiError";
  }
}
