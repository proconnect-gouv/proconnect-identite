export class InvalidEmailError extends Error {
  constructor(
    public didYouMean: string,
    options?: ErrorOptions,
  ) {
    super(`Did you mean "${didYouMean}" ?`, options);
    this.name = "InvalidEmailError";
  }
}

export class ForbiddenError extends Error {}

export class UnableToAutoJoinOrganizationError extends Error {
  constructor(
    public moderationId: number,
    options?: ErrorOptions,
  ) {
    super(`Linked to moderation ${moderationId}`, options);
    this.name = "UnableToAutoJoinOrganizationError";
  }
}

export class UserInOrganizationAlreadyError extends Error {}

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

export class UserMustConfirmToJoinOrganizationError extends Error {
  constructor(
    public organizationId: number,
    options?: ErrorOptions,
  ) {
    super(`Organization ${organizationId} confirmation is required`, options);
    this.name = "UserMustConfirmToJoinOrganizationError";
  }
}

export class AccessRestrictedToPublicServiceEmailError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AccessRestrictedToPublicServiceEmailError";
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

export class InvalidCredentialsError extends Error {}

export class EmailUnavailableError extends Error {}

export class WeakPasswordError extends Error {}

export class LeakedPasswordError extends Error {}

export class NoNeedVerifyEmailAddressError extends Error {}

export class InvalidTokenError extends Error {}

export class InvalidMagicLinkError extends Error {}

export class ApiAnnuaireError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiAnnuaireError";
  }
}

export class OfficialContactEmailVerificationNotNeededError extends Error {}

export class WebauthnRegistrationFailedError extends Error {}

export class WebauthnAuthenticationFailedError extends Error {}

export class UserNotLoggedInError extends Error {}

export class NoEmailFoundInUnauthenticatedSessionError extends Error {}

export class InvalidTotpTokenError extends Error {}

export class UserIsNot2faCapableError extends Error {}

export class OidcError extends Error {
  constructor(
    public error: string,
    public error_description?: string,
    options?: ErrorOptions,
  ) {
    super(`${error}: ${error_description}`, options);
    this.name = "OidcError";
  }
}

export class OidcFranceConnectBackChannelError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OidcFranceConnectError";
  }
}
