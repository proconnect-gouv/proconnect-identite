//

import type { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type {
  Organization,
  TrancheEffectifs,
} from "@proconnect-gouv/proconnect.identite/types";
import { with_dates, type WithDates } from "../dates";

//

type OrganizationRow = typeof organizations.$inferSelect;

export function to_organization<Row extends OrganizationRow>(
  row: Row,
): Organization & Omit<WithDates<Row>, keyof Organization> {
  return {
    ...with_dates(row),
    // the column is an unconstrained varchar; the app writes known tranche codes
    cached_tranche_effectifs: row.cached_tranche_effectifs as TrancheEffectifs,
  };
}
