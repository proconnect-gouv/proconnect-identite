//

import type { MatchCriteria } from "../managers/certification/certification-score.js";
import type { SourceDirigeant } from "../managers/certification/is-organization-dirigeant.js";

//

export class InvalidCertificationError extends Error {
  constructor(
    public source: SourceDirigeant,
    public siren: string,
    public organization_label: string,
    public matches?: Set<MatchCriteria>,
    message?: string,
    options?: ErrorOptions,
  ) {
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

export class ModerationNotFoundError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ModerationNotFoundError";
  }
}
