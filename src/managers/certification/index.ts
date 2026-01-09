//

import { InvalidCertificationError } from "@proconnect-gouv/proconnect.identite/errors";
import { isOrganizationDirigeantFactory } from "@proconnect-gouv/proconnect.identite/managers/certification";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";
import { captureException } from "@sentry/node";
import { AssertionError } from "node:assert";
import { OrganizationNotCoveredByCertificationDirigeant } from "../../config/errors";
import { ApiEntrepriseInfogreffeRepository } from "../../connectors/api-entreprise";
import { InseeApiRepository } from "../../connectors/api-insee";
import { RegistreNationalEntreprisesApiRepository } from "../../connectors/api-rne";
import { getFranceConnectUserInfo } from "../../repositories/user";
import { logger } from "../../services/log";

//

export const processCertificationDirigeant = isOrganizationDirigeantFactory({
  ApiEntrepriseInfogreffeRepository,
  FranceConnectApiRepository: { getFranceConnectUserInfo },
  InseeApiRepository: { findBySiren: InseeApiRepository.findBySiren },
  RegistreNationalEntreprisesApiRepository,
});

export const performCertificationDirigeant = async (
  organization: Organization,
  user_id: number,
) => {
  const { cause, details, ok } = await processCertificationDirigeant(
    organization,
    user_id,
  );

  if (cause === "organisation_not_covered") {
    throw new OrganizationNotCoveredByCertificationDirigeant(cause, {
      cause: new AssertionError({
        actual: organization,
      }),
    });
  }

  logger.info(
    details.dirigeant,
    `'(${details.source})`,
    " is the closest source dirigeant to ",
    details.identity,
    " with a score of ",
    details.matches.size,
    cause,
  );

  if (!ok) {
    const siren = organization.siret.substring(0, 9);
    const organization_label =
      organization.cached_libelle ?? organization.siret;
    const matches = cause === "close_match" ? details.matches : undefined;
    const error = new InvalidCertificationError(
      details.source,
      siren,
      organization_label,
      matches,
      cause,
      {
        cause: new AssertionError({
          expected: 0,
          actual: details.matches.size,
          operator: "processCertificationDirigeant",
        }),
      },
    );
    captureException(error);

    throw error;
  }
};

export const getInvalidCertificationErrorUrl = (
  error: InvalidCertificationError,
) => {
  const url = new URL(
    "/users/unable-to-certify-user-as-executive",
    // placeholder domain, not used
    "http://example.com",
  );

  if (error.matches) {
    url.searchParams.set("matches", [...error.matches].join(","));
  }

  url.searchParams.set("source", error.source);
  url.searchParams.set("siren", error.siren);
  url.searchParams.set("organization_label", error.organization_label);
  return url.pathname + url.search;
};
