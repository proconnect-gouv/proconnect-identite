export interface EmailDomain {
  id: number;
  organization_id: number;
  domain: string;
  verification_type:
    | "blacklisted"
    | "external"
    | "official_contact"
    | "refused"
    | "trackdechets_postal_mail"
    | "verified"
    | null;
  can_be_suggested: boolean;
  // updated when verification_type is changed
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
