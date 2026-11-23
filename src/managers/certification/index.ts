//

import { closeMatchDiff } from "@proconnect-gouv/proconnect.identite.runtime";
import { processCertificationDirigeantFactory } from "@proconnect-gouv/proconnect.identite/managers/certification";
import type {
  FranceConnectUserInfo,
  Organization,
} from "@proconnect-gouv/proconnect.identite/types";
import { captureException } from "@sentry/node";
import { AssertionError } from "node:assert";
import { match, P } from "ts-pattern";
import {
  CertificationDirigeantCloseMatchError,
  CertificationDirigeantNoMatchError,
  CertificationDirigeantOrganizationNotCoveredError,
} from "../../config/errors";
import { context, runtime } from "../../connectors/context";
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
  const { details } = result;
  const siren = organization.siret.substring(0, 9);
  const organization_label = organization.cached_libelle ?? organization.siret;

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

  const certification_dirigeant = runtime.as({
    type: "user",
    user_id: franceconnect_userinfo.user_id,
  }).certification_dirigeant;
  const targets = {
    organization_id: organization.id,
    user_id: franceconnect_userinfo.user_id,
  };
  const journaled = async (
    action: `certification_dirigeant.${keyof typeof certification_dirigeant}`,
    mutation: Promise<{ activity_id: number }>,
  ) => {
    const { activity_id } = await mutation;
    track(action, { activity_id, organization_id: organization.id });
  };

  await match(result)
    .with({ cause: "exact_match" }, ({ details: { source } }) =>
      journaled(
        "certification_dirigeant.certified",
        certification_dirigeant.certified.mutate({
          ...targets,
          outcome: { source },
        }),
      ),
    )
    .with({ cause: "close_match" }, async ({ cause, details }) => {
      await journaled(
        "certification_dirigeant.close_matched",
        certification_dirigeant.close_matched.mutate({
          ...targets,
          outcome: {
            diff: closeMatchDiff(details.identity, details.dirigeant),
            source: details.source,
          },
        }),
      );
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
    })
    .with({ cause: "organisation_not_covered" }, async ({ cause }) => {
      await journaled(
        "certification_dirigeant.not_covered",
        certification_dirigeant.not_covered.mutate({ ...targets, outcome: {} }),
      );
      throw new CertificationDirigeantOrganizationNotCoveredError(cause, {
        cause: new AssertionError({
          actual: organization,
        }),
      });
    })
    .with(
      { cause: P.union("below_threshold", "no_candidates") },
      async ({ cause, details: { source } }) => {
        await journaled(
          "certification_dirigeant.not_matched",
          certification_dirigeant.not_matched.mutate({
            ...targets,
            outcome: { reason: cause, source },
          }),
        );
        const error = new CertificationDirigeantNoMatchError(
          siren,
          organization_label,
          cause,
        );
        captureException(error);
        throw error;
      },
    )
    .exhaustive();
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
