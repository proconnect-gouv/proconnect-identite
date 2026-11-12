//

import { getCertificationDirigeantActivity } from "@proconnect-gouv/proconnect.identite.runtime";
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
import { context, db, runtime } from "../../connectors/context";
import { logger, track } from "../../services/log";

//

export const processCertificationDirigeant =
  processCertificationDirigeantFactory(context);

export const processCertificationDirigeantOrThrow = async (
  organization: Organization,
  franceconnect_userinfo: FranceConnectUserInfo,
) => {
  const result = await processCertificationDirigeant(
    organization,
    franceconnect_userinfo,
  );
  const { cause, details, ok } = result;
  const siren = organization.siret.substring(0, 9);

  if (details.source_selection.kind === "fallback") {
    logger.warn(
      "api_rne.pouvoirs_request.failed",
      { siren },
      details.source_selection.exception,
    );
    track("certification_dirigeant.rne.unavailable", {
      siren,
      source: details.source,
    });
  }

  const activity = getCertificationDirigeantActivity(result);
  const { activity_id } = await db.transaction((tx) =>
    runtime
      .as({ type: "user", user_id: franceconnect_userinfo.user_id })
      .record(tx, {
        ...activity,
        organization_id: organization.id,
        user_id: franceconnect_userinfo.user_id,
      }),
  );
  track(activity.action, { activity_id, organization_id: organization.id });

  if (!ok && cause === "organisation_not_covered") {
    throw new CertificationDirigeantOrganizationNotCoveredError(cause, {
      cause: new AssertionError({
        actual: organization,
      }),
    });
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
    const organization_label =
      organization.cached_libelle ?? organization.siret;

    const error = new CertificationDirigeantNoMatchError(
      siren,
      organization_label,
      cause,
    );

    captureException(error);

    throw error;
  }
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
