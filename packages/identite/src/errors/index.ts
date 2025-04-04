//

export class InvalidCertificationError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidCertificationError";
  }
}

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

export class OrganizationNotFoundError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OrganizationNotFoundError";
  }
}

export class UserNotFoundError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UserNotFoundError";
  }
}
