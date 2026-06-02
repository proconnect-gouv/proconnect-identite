import { z } from "zod";

export const EmailDomainApprovedVerificationValues = [
  "official_contact",
  "trackdechets_postal_mail",
  "verified",
  "external", // domain used by external employees (eg. ext.numerique.gouv.fr)
] as const;

export const EmailDomainApprovedVerificationEnum = z.enum(
  EmailDomainApprovedVerificationValues,
);

export type EmailDomainApprovedVerificationType = z.output<
  typeof EmailDomainApprovedVerificationEnum
>;

// domain is not verified, but users are still permitted to use it
export const EmailDomainPendingVerificationValues = [
  "not_verified_yet",
] as const;

export const EmailDomainPendingVerificationEnum = z.enum(
  EmailDomainPendingVerificationValues,
);

export type EmailDomainPendingVerificationType = z.output<
  typeof EmailDomainPendingVerificationEnum
>;

export const EmailDomainRejectedVerificationValues = [
  "blacklisted", // unused
  "refused",
] as const;

export const EmailDomainRejectedVerificationEnum = z.enum(
  EmailDomainRejectedVerificationValues,
);

export type EmailDomainRejectedVerificationType = z.output<
  typeof EmailDomainRejectedVerificationEnum
>;

export const EmailDomainNoPendingVerificationEnum = z.enum([
  ...EmailDomainApprovedVerificationValues,
  ...EmailDomainRejectedVerificationValues,
]);

export type EmailDomainNoPendingVerificationType = z.output<
  typeof EmailDomainNoPendingVerificationEnum
>;

export const EmailDomainVerificationEnum = z.enum([
  ...EmailDomainApprovedVerificationValues,
  ...EmailDomainPendingVerificationValues,
  ...EmailDomainRejectedVerificationValues,
]);

export type EmailDomainVerificationType = z.output<
  typeof EmailDomainVerificationEnum
>;

export const EmailDomainSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  domain: z.string(),
  verification_type: EmailDomainVerificationEnum,
  // Unused.
  can_be_suggested: z.boolean(),
  // Can be updated when verification_type changes.
  // In practice, entries are deleted and recreated rather than updated directly
  verified_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type EmailDomain = z.output<typeof EmailDomainSchema>;
