//

import type { components } from "#openapi";

//

export type RegistreNationalEntreprisesOpenApiError =
  components["schemas"]["Error"];

//

export class RegistreNationalEntreprisesApiAuthError extends Error {
  constructor(message?: string, options?: { cause?: Error } | undefined) {
    super(message, options);
    this.name = "RegistreNationalEntreprisesApiAuthError";
  }
}

export class RegistreNationalEntreprisesApiError extends Error {
  constructor(
    public issue: RegistreNationalEntreprisesOpenApiError = {
      errorCode: "UNKNOWN",
      message: "UNKNOWN",
      type: "UNKNOWN",
      webserviceCode: "UNKNOWN",
    },
    options?: { cause?: Error } | undefined,
  ) {
    super(
      `[${issue.code}] ${issue.errorCode}: ${issue.type}\n${issue.message}`,
      options,
    );
    this.name = "RegistreNationalEntreprisesApiError";
  }
}
