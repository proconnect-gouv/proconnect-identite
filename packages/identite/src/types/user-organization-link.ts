import { z } from "zod";

export const StrongLinkValues = ["organization_dirigeant"] as const;

export const WeakLinkValues = [
  "code_sent_to_official_contact_email",
  "domain",
  "imported_from_coop_mediation_numerique",
  "imported_from_inclusion_connect",
  "in_liste_dirigeants_rna",
  "in_liste_dirigeants_rne",
  "official_contact_email",
  "ordre_professionnel_domain",
  "proof_received",
  "verified_by_coop_mediation_numerique",
  // Used in the sandbox environment to bypass the verification process
  "bypassed",
] as const;

// This link value should be considered as unverified.
// However, doing so would trigger a FranceConnect authentication requirement for the user.
// Users shouldn't face inconvenience while waiting for domain review completion.
// Instead, we should remove these unverified domains and then eliminate this special case from the codebase.
export const SuperWeakLinkValues = ["domain_not_verified_yet"] as const;

export const SuperWeakLinkEnum = z.enum(SuperWeakLinkValues);

export const VerifiedLinkValues = [
  ...StrongLinkValues,
  ...WeakLinkValues,
  ...SuperWeakLinkValues,
] as const;

export const VerifiedLinkEnum = z.enum(VerifiedLinkValues);

export const UnverifiedLinkValues = [
  "no_validation_means_available",
  "no_verification_means_for_entreprise_unipersonnelle",
  "no_verification_means_for_small_association",
  "no_verification_means_for_small_organization",
] as const;

export const UnverifiedLinkEnum = z.enum(UnverifiedLinkValues);

export const LinkEnum = z.enum([
  ...VerifiedLinkValues,
  ...UnverifiedLinkValues,
]);

export type LinkType = z.output<typeof LinkEnum>;

export const BaseUserOrganizationLinkSchema = z.object({
  is_external: z.boolean(),
  verification_type: LinkEnum,
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
).extend(
  UserOrganizationLinkSchema.pick({
    is_external: true,
    needs_official_contact_email_verification: true,
  }).partial().shape,
);

export type InsertUserOrganizationLink = z.output<
  typeof InsertUserOrganizationLinkSchema
>;
