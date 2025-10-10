//
// @see https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn/
//

/** @see https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn/#type-AuthenticatorProtocol */
type AuthenticatorProtocol = "u2f" | "ctap2";

/** @see https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn/#type-Ctap2Version */
type Ctap2Version = "ctap2_0" | "ctap2_1";

/**
 * Virtual authenticator options.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn/#type-VirtualAuthenticatorOptions
 */
export interface VirtualAuthenticatorOptions {
  /** The protocol supported by the authenticator. */
  protocol: AuthenticatorProtocol;
  /** Defaults to ctap2_0. */
  ctap2Version?: Ctap2Version;
  /** The transport method for the authenticator. */
  transport: AuthenticatorTransport;
  /** Defaults to false. */
  hasResidentKey?: boolean;
  /** Defaults to false. */
  hasUserVerification?: boolean;
  /** If set to true, the authenticator will support the largeBlob extension. Defaults to false. */
  hasLargeBlob?: boolean;
  /** If set to true, the authenticator will support the credBlob extension. Defaults to false. */
  hasCredBlob?: boolean;
  /** If set to true, the authenticator will support the minPinLength extension. Defaults to false. */
  hasMinPinLength?: boolean;
  /** If set to true, the authenticator will support the prf extension. Defaults to false. */
  hasPrf?: boolean;
  /** If set to true, tests of user presence will succeed immediately. Otherwise, they will not be resolved. Defaults to true. */
  automaticPresenceSimulation?: boolean;
  /** Sets whether User Verification succeeds or fails for an authenticator. Defaults to false. */
  isUserVerified?: boolean;
  /** Credentials created by this authenticator will have the backup eligibility (BE) flag set to this value. Defaults to false. */
  defaultBackupEligibility?: boolean;
  /** Credentials created by this authenticator will have the backup state (BS) flag set to this value. Defaults to false. */
  defaultBackupState?: boolean;
}
