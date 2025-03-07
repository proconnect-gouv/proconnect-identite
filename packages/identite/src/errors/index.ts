export class InvalidSiretError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidSiretError";
  }
}
export class NotFoundError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "NotFoundError";
  }
}
export class OrganizationNotActiveError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OrganizationNotActiveError";
  }
}
