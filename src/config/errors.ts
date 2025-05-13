import { AxiosError } from "axios";

export class InvalidEmailError extends Error {
  constructor(public didYouMean: string) {
    super();
    this.didYouMean = didYouMean;
  }
}

export class ForbiddenError extends Error {}

export class UnableToAutoJoinOrganizationError extends Error {
  constructor(public moderationId: number) {
    super();
    this.moderationId = moderationId;
  }
}

export class UserInOrganizationAlreadyError extends Error {}

export class UserAlreadyAskedToJoinOrganizationError extends Error {
  constructor(public moderationId: number) {
    super();
    this.moderationId = moderationId;
  }
}

export class UserMustConfirmToJoinOrganizationError extends Error {
  constructor(public organizationId: number) {
    super();
    this.organizationId = organizationId;
  }
}

export class InvalidCredentialsError extends Error {}

export class EmailUnavailableError extends Error {}

export class WeakPasswordError extends Error {}

export class LeakedPasswordError extends Error {}

export class NoNeedVerifyEmailAddressError extends Error {}

export class InvalidTokenError extends Error {}

export class InvalidMagicLinkError extends Error {}

export class ApiAnnuaireError extends Error {}

export class ApiAnnuaireNotFoundError extends Error {}

export class ApiAnnuaireTooManyResultsError extends Error {}

export class ApiAnnuaireInvalidEmailError extends Error {}

export class ApiAnnuaireConnectionError extends Error {}

export class BrevoApiError extends Error {
  constructor(error: AxiosError<{ message: string; code: string }>) {
    if (error.response?.data?.code && error.response?.data?.message) {
      super(error.response?.data?.message);
      this.name = `BrevoApiError ${error.response?.data?.code}`;
    } else {
      super();
    }
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
  ) {
    super();
    this.error = error;
    this.error_description = error_description;
  }
}

export class OidcFranceConnectBackChannelError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OidcFranceConnectError";
  }
}
