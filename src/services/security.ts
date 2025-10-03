import { hasIn, isEmpty, isString } from "lodash-es";
import notificationMessages from "../config/notification-messages";
import type { AmrValue } from "../types/express-session";

export const isNotificationLabelValid = (label: unknown): label is string => {
  if (!isString(label) || isEmpty(label)) {
    return false;
  }

  return hasIn(notificationMessages, label);
};

export const addAuthenticationMethodReference = (
  amr: AmrValue[],
  newAmrValue: AmrValue,
) => {
  const newAmr = [...amr];

  if (!newAmr.includes(newAmrValue)) {
    newAmr.push(newAmrValue);
  }

  if (isTwoFactorAuthenticated(newAmr) && !newAmr.includes("mfa")) {
    newAmr.push("mfa");
  }

  return newAmr;
};

export const isTwoFactorAuthenticated = (
  authenticationMethodsReferences: Array<AmrValue>,
) => {
  const hasPwdOrEmail =
    authenticationMethodsReferences.includes("pwd") ||
    authenticationMethodsReferences.includes("email-link");
  const hasTotp = authenticationMethodsReferences.includes("totp");
  // Read more about the usage of "pop" to describe a passkey authentication:
  // https://developer.okta.com/docs/guides/configure-amr-claims-mapping/main/#supported-amr-values-by-authenticator-type
  const hasPop = authenticationMethodsReferences.includes("pop");
  // An authenticator that supports user verification is multi-factor capable.
  // See: https://www.w3.org/TR/webauthn/#sctn-authentication-factor-capability
  // More information on userVerification: https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html
  const hasUv = authenticationMethodsReferences.includes("uv");

  return (
    (hasPwdOrEmail && hasTotp) || (hasPwdOrEmail && hasPop) || (hasPop && hasUv)
  );
};

export const isOneFactorAuthenticated = (
  authenticationMethodsReferences: Array<AmrValue>,
) => {
  const hasPwd = authenticationMethodsReferences.includes("pwd");
  const hasEmail = authenticationMethodsReferences.includes("email-link");
  const hasPop = authenticationMethodsReferences.includes("pop");
  return hasPwd || hasEmail || hasPop;
};
