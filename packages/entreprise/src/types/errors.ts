//

import type { components } from "#openapi";
import assert from "node:assert/strict";

//

export type OpenApiError = components["schemas"]["Error"];

export class EntrepriseApiError extends Error {
  constructor(
    public issues: OpenApiError = { errors: [] },
    options?: { cause?: Error } | undefined,
  ) {
    super(
      (issues?.errors ?? []).map((issue) => issue.title).join(","),
      options,
    );
    this.name = "EntrepriseApiError";
  }

  static assert(value: unknown): asserts value is EntrepriseApiError {
    assert.ok(value instanceof EntrepriseApiError);
  }
}
export class EntrepriseApiConnectionError extends Error {
  constructor(...params: ConstructorParameters<typeof Error>) {
    super(...params);
    this.name = "EntrepriseApiConnectionError";
  }
}
export class EntrepriseApiInvalidSiret extends Error {
  static assert(error: unknown): asserts error is EntrepriseApiInvalidSiret {
    EntrepriseApiError.assert(error);
    const [{ code, detail, title }] = error.issues.errors;
    assert.equal(code, "00302");
    assert.equal(title, "Entité non traitable");
    assert.equal(detail, "Le numéro de siret n'est pas correctement formatté");
  }
  static isInvalidSiret(value: unknown): value is EntrepriseApiError {
    try {
      EntrepriseApiInvalidSiret.assert(value);
      return true;
    } catch {
      return false;
    }
  }
}
