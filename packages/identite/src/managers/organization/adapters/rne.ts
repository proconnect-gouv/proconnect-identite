import type { ApiRneOrganizationInfo } from "#src/types";
import type { ReponseCompany } from "@proconnect-gouv/proconnect.registre_national_entreprises/types";

//

export function toApiRneOrganizationInfo(
  rneData: ReponseCompany | undefined,
): ApiRneOrganizationInfo {
  return {
    denominationUsuelleEtablissementPrincipal:
      rneData?.formality?.content?.personnePhysique?.etablissementPrincipal
        ?.descriptionEtablissement?.nomCommercial || undefined,
  };
}
