import { z } from "zod";

export const EmailDomainApprovedVerificationTypes = [
  "official_contact",
  "trackdechets_postal_mail",
  "verified",
  "external", // domain used by external employees (eg. ext.numerique.gouv.fr)
] as const;

export type EmailDomainApprovedVerificationType = z.output<
  typeof EmailDomainApprovedVerificationTypes
>;

// domain is not verified, but users are still permitted to use it
export const EmailDomainPendingVerificationTypes = [
  "not_verified_yet",
] as const;

export type EmailDomainPendingVerificationType = z.output<
  typeof EmailDomainPendingVerificationTypes
>;

export const EmailDomainRejectedVerificationTypes = [
  "blacklisted", // unused
  "refused",
] as const;

export type EmailDomainRejectedVerificationType = z.output<
  typeof EmailDomainRejectedVerificationTypes
>;

export const EmailDomainNoPendingVerificationTypes = z.enum([
  ...EmailDomainApprovedVerificationTypes,
  ...EmailDomainRejectedVerificationTypes,
]);

export type EmailDomainNoPendingVerificationType = z.output<
  typeof EmailDomainNoPendingVerificationTypes
>;

export const EmailDomainVerificationTypes = z.enum([
  ...EmailDomainApprovedVerificationTypes,
  ...EmailDomainPendingVerificationTypes,
  ...EmailDomainRejectedVerificationTypes,
]);

export type EmailDomainVerificationType = z.output<
  typeof EmailDomainVerificationTypes
>;

export const EmailDomainSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  domain: z.string(),
  verification_type: EmailDomainVerificationTypes,
  // Unused.
  can_be_suggested: z.boolean(),
  // Can be updated when verification_type changes.
  // In practice, entries are deleted and recreated rather than updated directly
  verified_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type EmailDomain = z.output<typeof EmailDomainSchema>;
