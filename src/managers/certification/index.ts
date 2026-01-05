//

import { processCertificationDirigeantFactory } from "@proconnect-gouv/proconnect.identite/managers/certification";
import type {
  FranceConnectUserInfo,
  Organization,
} from "@proconnect-gouv/proconnect.identite/types";
import { captureException } from "@sentry/node";
import { AssertionError } from "node:assert";
import {
  CertificationDirigeantCloseMatchError,
  CertificationDirigeantNoMatchError,
  CertificationDirigeantOrganizationNotCoveredError,
} from "../../config/errors";
import { ApiEntrepriseInfogreffeRepository } from "../../connectors/api-entreprise";
import { InseeApiRepository } from "../../connectors/api-insee";
import { RegistreNationalEntreprisesApiRepository } from "../../connectors/api-rne";
import { updateUserOrganizationLink } from "../../repositories/organization/setters";
import { logger } from "../../services/log";

//

export const processCertificationDirigeant =
  processCertificationDirigeantFactory({
    ApiEntrepriseInfogreffeRepository,
    InseeApiRepository: { findBySiren: InseeApiRepository.findBySiren },
    RegistreNationalEntreprisesApiRepository,
  });

export const processCertificationDirigeantOrThrow = async (
  organization: Organization,
  franceconnect_userinfo: FranceConnectUserInfo,
  user_id: number,
) => {
  const { cause, details, ok } = await processCertificationDirigeant(
    organization,
    franceconnect_userinfo,
  );
  const siren = organization.siret.substring(0, 9);

  if (!ok && cause === "organisation_not_covered") {
    throw new CertificationDirigeantOrganizationNotCoveredError(cause, {
      cause: new AssertionError({
        actual: organization,
      }),
    });
  }

  if (!ok) {
    logger.info(
      details.dirigeant,
      `'(${details.source})`,
      " is the closest source dirigeant to ",
      details.identity,
      " with a score of ",
      details.matches.size,
      cause,
    );
  }

  if (!ok && cause === "close_match") {
    const organization_label =
      organization.cached_libelle ?? organization.siret;
    const error = new CertificationDirigeantCloseMatchError(
      details.source,
      siren,
      organization_label,
      details.matches,
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

  if (!ok) {
    const error = new CertificationDirigeantNoMatchError(siren, cause);

    captureException(error);

    throw error;
  }

  return await updateUserOrganizationLink(organization.id, user_id, {
    verification_type: "organization_dirigeant",
    verified_at: new Date(),
    has_been_greeted: false,
  });
};

export const getCertificationDirigeantCloseMatchErrorUrl = (
  error: CertificationDirigeantCloseMatchError,
) => {
  const url = new URL(
    "/users/certification-dirigeant/close-match-error",
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
