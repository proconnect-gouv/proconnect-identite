export interface EmailDomain {
  id: number;
  organization_id: number;
  domain: string;
  verification_type: // Unused
  | "blacklisted"
    // domain used by external employees (eg. ext.numerique.gouv.fr)
    | "external"
    | "refused"
    // domain is not verified, but users are still permitted to use it
    | null
    // the three following verification types can coexist at the same time
    | "official_contact"
    | "trackdechets_postal_mail"
    | "verified";
  // Unused.
  can_be_suggested: boolean;
  // Can be updated when verification_type changes.
  // In practice, entries are deleted and recreated rather than updated directly
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
