import type { components } from "#openapi";

//
export type ApiOpendatasoftResponseBadRequestError =
  components["responses"]["bad_request"]["content"]["application/json; charset=utf-8"];

export class ApiOpendatasoftError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiOpendatasoftError";
  }
}

export class ApiOpendatasoftNotFoundError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiOpendatasoftNotFoundError";
  }
}
export class ApiOpendatasoftConnectionError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiOpendatasoftConnectionError";
  }
}

export class ApiOpendatasoftUnprocessableEntityError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiOpendatasoftUnprocessableEntityError";
  }
}
