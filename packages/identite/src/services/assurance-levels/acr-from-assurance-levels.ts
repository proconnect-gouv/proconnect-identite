//

import { match, P } from "ts-pattern";

export type AssuranceLevels = {
  aal: "single_factor" | "multi_factor";
  ial: "declared" | "low";
  oal: "declared" | "moderated" | "certified";
};

export const acrFromAssuranceLevels = ({ aal, ial, oal }: AssuranceLevels) =>
  match({ aal, ial, oal })
    .with(
      // Identity and Organization assurance levels too low
      { ial: "declared", oal: "declared" },
      // Le cas IAL declared & OAL certified correspond à une certification dirigeant/employé sans FranceConnection
      // IAL must be at least low for OAL to be certified
      { ial: "declared", oal: "certified" },
      () => null,
    )
    .with(
      { aal: "single_factor", ial: "declared", oal: "moderated" },
      { aal: "single_factor", ial: "low", oal: "declared" },
      () => "eidas0",
    )
    .with(
      { aal: "multi_factor", ial: "declared", oal: "moderated" },
      { aal: "multi_factor", ial: "low", oal: "declared" },
      () => "eidas0-mfa",
    )
    .with(
      {
        aal: "single_factor",
        ial: "low",
        oal: P.union("moderated", "certified"),
      },
      () => "eidas1",
    )
    .with(
      {
        aal: "multi_factor",
        ial: "low",
        oal: P.union("moderated", "certified"),
      },
      () => "eidas1-mfa",
    )
    .exhaustive();
