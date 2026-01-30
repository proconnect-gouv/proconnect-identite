//

import type { Organization } from "#src/types";

//

const SMALL_TRANCHE_EFFECTIFS = [null, "NN", "00", "01", "02", "03", "11", "12"];

export function hasLessThanFiftyEmployees({
  cached_tranche_effectifs,
}: Pick<Organization, "cached_tranche_effectifs">): boolean {
  return SMALL_TRANCHE_EFFECTIFS.includes(cached_tranche_effectifs);
}
