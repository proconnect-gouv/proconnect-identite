//

import { SuperWeakLinkEnum, UnverifiedLinkEnum } from "#src/types";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";

//

export function getMemberIdsPromotedByDomain({
  domain,
  members,
}: {
  domain: string;
  members: ReadonlyArray<{
    email: string;
    id: number;
    verification_type: string;
  }>;
}) {
  return members
    .filter(
      ({ email, verification_type }) =>
        getEmailDomain(email) === domain &&
        (UnverifiedLinkEnum.safeParse(verification_type).success ||
          SuperWeakLinkEnum.safeParse(verification_type).success),
    )
    .map(({ id }) => id);
}
