//

import type { components } from "#openapi";
import assert from "node:assert/strict";

//

export type OpenApiError = components["schemas"]["Error"];

export class ApiEntrepriseError extends Error {
  constructor(
    public issues: OpenApiError = { errors: [] },
    options?: { cause?: Error } | undefined,
  ) {
    super(
      (issues?.errors ?? []).map((issue) => issue.title).join(","),
      options,
    );
    this.name = "ApiEntrepriseError";
  }

  static assert(value: unknown): asserts value is ApiEntrepriseError {
    assert.ok(value instanceof ApiEntrepriseError);
  }
}
export class ApiEntrepriseConnectionError extends Error {
  constructor(...params: ConstructorParameters<typeof Error>) {
    super(...params);
    this.name = "ApiEntrepriseConnectionError";
  }
}
export class ApiEntrepriseInvalidSiret extends Error {
  static assert(error: unknown): asserts error is ApiEntrepriseInvalidSiret {
    ApiEntrepriseError.assert(error);
    const [{ code, detail, title }] = error.issues.errors;
    assert.equal(code, "00302");
    assert.equal(title, "Entité non traitable");
    assert.equal(detail, "Le numéro de siret n'est pas correctement formatté");
  }
  static isInvalidSiret(value: unknown): value is ApiEntrepriseError {
    try {
      ApiEntrepriseInvalidSiret.assert(value);
      return true;
    } catch {
      return false;
    }
  }
}
