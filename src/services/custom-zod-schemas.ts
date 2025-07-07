import {
  isEmailValid,
  isNameValid,
  isPhoneNumberValid,
  isSiretValid,
  isVisibleString,
} from "@gouvfr-lasuite/proconnect.core/security";
import { z } from "zod";
import { normalizeOfficialContactEmailVerificationToken } from "./normalize-official-contact-email-verification-token";
import { isNotificationLabelValid } from "./security";

export const siretSchema = () =>
  z
    .string()
    .trim()
    .refine(isSiretValid)
    .transform((val) => val.replace(/\s/g, ""));

export const emailSchema = () =>
  z.string().trim().toLowerCase().refine(isEmailValid);

export const nameSchema = () =>
  z.string().trim().min(1).refine(isVisibleString).refine(isNameValid);

export const phoneNumberSchema = () =>
  z.union([
    z.string().trim().refine(isPhoneNumberValid),
    z.literal("").transform(() => null),
  ]);

const pattern = /^(?![\d\s]+$).*/;
export const jobSchema = () =>
  z
    .string()
    .trim()
    .min(1)
    .refine(isVisibleString)
    .refine((value) => pattern.test(value));

export const idSchema = () =>
  z
    .string()
    .trim()
    .min(1)
    .refine((val) => val.match(/^\d*$/))
    .transform((val) => parseInt(val, 10));

export const optionalBooleanSchema = () =>
  z
    .string()
    .optional()
    .transform((val) => val === "true");

export const notificationLabelSchema = () =>
  z.string().refine(isNotificationLabelValid).optional();

export const officialContactEmailVerificationTokenSchema = () =>
  z
    .string()
    .trim()
    .min(1)
    .transform((val) => normalizeOfficialContactEmailVerificationToken(val));

export const codeSchema = () =>
  z
    .string()
    .trim()
    .min(1)
    .transform((val) => val.replace(/\s+/g, ""));

export const oidcErrorSchema = () =>
  z.enum([
    // https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2
    "invalid_request",
    "unauthorized_client",
    "access_denied",
    "unsupported_response_type",
    "invalid_scope",
    "server_error",
    "temporarily_unavailable",
    // https://openid.net/specs/openid-connect-core-1_0.html#AuthError
    "interaction_required",
    "login_required",
    "account_selection_required",
    "consent_required",
    "invalid_request_uri",
    "invalid_request_object",
    "request_not_supported",
    "request_uri_not_supported",
    "registration_not_supported",
  ]);
