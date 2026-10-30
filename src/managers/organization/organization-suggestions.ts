import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { users_organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { IdentiteDatabase } from "@proconnect-gouv/proconnect.identite.runtime";
import { eq } from "drizzle-orm";
import {
  findOrganizationBySiret,
  findOrganizationsByVerifiedEmailDomain,
} from "../../repositories/organization";
import {
  isArmeeDomain,
  isEducationNationaleDomain,
} from "../../services/organization";

//

const ARMEE_ORGANIZATION_SIRET = "11009001600053";

export type OrganizationSuggestionsDependencies = {
  db: IdentiteDatabase;
  maxSuggestedOrganizations: number;
  usesAFreeEmailProvider: (email: string) => boolean;
};

//

export async function getOrganizationSuggestions(
  { email, user_id }: { email: string; user_id: number },
  {
    db,
    maxSuggestedOrganizations,
    usesAFreeEmailProvider,
  }: OrganizationSuggestionsDependencies,
) {
  if (usesAFreeEmailProvider(email)) {
    return [];
  }

  const [membership] = await db
    .select({ organization_id: users_organizations.organization_id })
    .from(users_organizations)
    .where(eq(users_organizations.user_id, user_id))
    .limit(1);
  if (membership) {
    return [];
  }

  const domain = getEmailDomain(email);

  if (isEducationNationaleDomain(domain)) {
    return [];
  }

  if (isArmeeDomain(domain)) {
    const armeeOrganization = await findOrganizationBySiret(
      db,
      ARMEE_ORGANIZATION_SIRET,
    );
    if (armeeOrganization) {
      return [armeeOrganization];
    }
  }

  const organizationsSuggestions = await findOrganizationsByVerifiedEmailDomain(
    db,
    domain,
  );

  if (organizationsSuggestions.length <= maxSuggestedOrganizations) {
    return organizationsSuggestions;
  }

  // if the number of suggestions is too high,
  // only suggest organizations that represent 20% of the total member count

  const totalMemberCount = organizationsSuggestions.reduce(
    (sum, { member_count }) => sum + member_count,
    0,
  );

  if (totalMemberCount === 0) {
    return [];
  }

  return organizationsSuggestions.filter(
    ({ member_count }) => member_count / totalMemberCount >= 0.2,
  );
}
