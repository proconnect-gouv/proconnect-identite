import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";
import {
  isArmeeDomain,
  isEducationNationaleDomain,
} from "../../services/organization";

//

const ARMEE_ORGANIZATION_SIRET = "11009001600053";

export type SuggestedOrganization = Organization & {
  member_count: number | null;
};

export type OrganizationSuggestionsDependencies = {
  maxSuggestedOrganizations: number;
  organizations: {
    findBySiret: (siret: string) => Promise<Organization | undefined>;
    findByUserId: (user_id: number) => Promise<Organization[]>;
    findByVerifiedEmailDomain: (
      domain: string,
    ) => Promise<SuggestedOrganization[]>;
  };
  usesAFreeEmailProvider: (email: string) => boolean;
};

//

export async function getOrganizationSuggestions(
  { email, user_id }: { email: string; user_id: number },
  {
    maxSuggestedOrganizations,
    organizations,
    usesAFreeEmailProvider,
  }: OrganizationSuggestionsDependencies,
): Promise<Organization[]> {
  if (usesAFreeEmailProvider(email)) {
    return [];
  }

  const userOrganizations = await organizations.findByUserId(user_id);
  if (userOrganizations.length > 0) {
    return [];
  }

  const domain = getEmailDomain(email);

  if (isEducationNationaleDomain(domain)) {
    return [];
  }

  if (isArmeeDomain(domain)) {
    const armeeOrganization = await organizations.findBySiret(
      ARMEE_ORGANIZATION_SIRET,
    );
    if (armeeOrganization) {
      return [armeeOrganization];
    }
  }

  const organizationsSuggestions =
    await organizations.findByVerifiedEmailDomain(domain);

  if (organizationsSuggestions.length <= maxSuggestedOrganizations) {
    return organizationsSuggestions;
  }

  // if the number of suggestions is too high,
  // only suggest organizations that represent 20% of the total member count

  const totalMemberCount = organizationsSuggestions.reduce(
    (sum, org) => sum + (org.member_count ?? 0),
    0,
  );

  if (totalMemberCount === 0) {
    return [];
  }

  return organizationsSuggestions.filter(
    (org) => (org.member_count ?? 0) / totalMemberCount >= 0.2,
  );
}
