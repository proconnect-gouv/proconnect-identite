//

import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";

//

export const organizationColumns = {
  cached_adresse: organizations.cached_adresse,
  cached_libelle: organizations.cached_libelle,
  cached_siege_social: organizations.cached_siege_social,
  id: organizations.id,
  siret: organizations.siret,
};
