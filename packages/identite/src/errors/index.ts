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

export class ModerationNotFoundError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ModerationNotFoundError";
  }
}

export class UserInOrganizationAlreadyError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UserInOrganizationAlreadyError";
  }
}

export class UserAlreadyAskedToJoinOrganizationError extends Error {
  constructor(
    public moderationId: number,
    options: ErrorOptions,
  ) {
    super(
      `Moderation ${moderationId} already asked to join organization`,
      options,
    );
    this.name = "UserAlreadyAskedToJoinOrganizationError";
  }
}

export class UserModerationRejectedError extends Error {
  constructor(
    public moderationId: number,
    options?: ErrorOptions,
  ) {
    super(`Moderation ${moderationId} was rejected`, options);
    this.name = "UserModerationRejectedError";
  }
}

export class DomainRestrictedError extends Error {
  constructor(
    public organizationId: number,
    options?: ErrorOptions,
  ) {
    super(`Organization ${organizationId} is domain restricted`, options);
    this.name = "DomainRestrictedError";
  }
}

export class AccessRestrictedToPublicServiceEmailError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AccessRestrictedToPublicServiceEmailError";
  }
}

export class UnableToAutoJoinOrganizationError extends Error {
  constructor(
    public moderationId: number,
    options?: ErrorOptions,
  ) {
    super(`Linked to moderation ${moderationId}`, options);
    this.name = "UnableToAutoJoinOrganizationError";
  }
}
