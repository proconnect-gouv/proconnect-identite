//

import { z } from "zod";

//

export const EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES = z.enum([
  "official_contact",
  "trackdechets_postal_mail",
  "verified",
]);

export type EmailDomainApprovedVerificationType = z.output<
  typeof EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES
>;

//

export const EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES = z.enum([
  "blacklisted", // unused
  "external", // domain used by external employees (eg. ext.numerique.gouv.fr)
  "refused",
]);

export type EmailDomainRejectedVerificationType = z.output<
  typeof EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES
>;

//

export type EmailDomainVerificationType =
  | EmailDomainApprovedVerificationType
  | EmailDomainRejectedVerificationType
  | null; // domain is not verified, but users are still permitted to use it

export interface EmailDomain {
  id: number;
  organization_id: number;
  domain: string;
  verification_type: EmailDomainVerificationType;
  // Unused.
  can_be_suggested: boolean;
  // Can be updated when verification_type changes.
  // In practice, entries are deleted and recreated rather than updated directly
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
