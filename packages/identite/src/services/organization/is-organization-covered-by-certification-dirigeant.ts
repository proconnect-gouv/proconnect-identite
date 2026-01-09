import { CATEGORIES_JURIDIQUES } from "#src/data/certification";
import type { Organization } from "#src/types";

export const isOrganizationCoveredByCertificationDirigeant = ({
  cached_categorie_juridique,
}: Organization) =>
  CATEGORIES_JURIDIQUES.map(
    ({ categorie_juridique }) => categorie_juridique,
  ).includes(cached_categorie_juridique || "");
