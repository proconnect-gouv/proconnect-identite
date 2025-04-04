import { z } from "zod";

export const UserOrganizationLinkVerificationTypeSchema = z.enum([
  "code_sent_to_official_contact_email",
  "domain",
  "imported_from_coop_mediation_numerique",
  "imported_from_inclusion_connect",
  "in_liste_dirigeants_rna",
  "organization_dirigeant",
  "no_validation_means_available",
  "no_verification_means_for_entreprise_unipersonnelle",
  "no_verification_means_for_small_association",
  "official_contact_email",
  "organization_dirigeant",
  // Used in the sandbox environment to bypass the verification process
  "bypassed",
]);

export type UserOrganizationLinkVerificationType = z.output<
  typeof UserOrganizationLinkVerificationTypeSchema
>;

//

export const BaseUserOrganizationLinkSchema = z.object({
  is_external: z.boolean(),
  verification_type: UserOrganizationLinkVerificationTypeSchema.nullable(),
  // updated when verification_type is changed
  verified_at: z.date().or(z.literal(null)),
  has_been_greeted: z.boolean(),
  needs_official_contact_email_verification: z.boolean(),
  official_contact_email_verification_token: z.string().nullable(),
  official_contact_email_verification_sent_at: z.date().nullable(),
});

export type BaseUserOrganizationLink = z.output<
  typeof BaseUserOrganizationLinkSchema
>;

//

export const UserOrganizationLinkSchema = BaseUserOrganizationLinkSchema.extend(
  {
    user_id: z.number(),
    organization_id: z.number(),
    created_at: z.date(),
    updated_at: z.date(),
  },
);

export type UserOrganizationLink = z.output<typeof UserOrganizationLinkSchema>;

//

export const InsertUserOrganizationLinkSchema = UserOrganizationLinkSchema.pick(
  {
    organization_id: true,
    user_id: true,
    verification_type: true,
  },
).merge(
  UserOrganizationLinkSchema.pick({
    is_external: true,
    needs_official_contact_email_verification: true,
  }).partial(),
);

export type InsertUserOrganizationLink = z.output<
  typeof InsertUserOrganizationLinkSchema
>;
