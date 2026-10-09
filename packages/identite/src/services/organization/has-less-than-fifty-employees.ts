//

import type { Organization } from "#src/types";

export const hasLessThanFiftyEmployees = ({
  cached_tranche_effectifs_unite_legale,
}: Organization): boolean => {
  return [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs_unite_legale,
  );
};
