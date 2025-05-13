import type { NextFunction, Request, Response } from "express";
import Provider, { errors } from "oidc-provider";
import { z } from "zod";
import {
  ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT,
  ACR_VALUE_FOR_IAL1_AAL1,
  ACR_VALUE_FOR_IAL1_AAL2,
  ACR_VALUE_FOR_IAL2_AAL1,
  ACR_VALUE_FOR_IAL2_AAL2,
  FEATURE_ALWAYS_RETURN_EIDAS1_FOR_ACR,
} from "../config/env";
import { OidcError } from "../config/errors";
import {
  getSessionStandardizedAuthenticationMethodsReferences,
  getUserFromAuthenticatedSession,
  isIdentityConsistencyChecked,
  isWithinAuthenticatedSession,
  isWithinTwoFactorAuthenticatedSession,
} from "../managers/session/authenticated";
import { setLoginHintInUnauthenticatedSession } from "../managers/session/unauthenticated";
import { findByClientId } from "../repositories/oidc-client";
import {
  certificationDirigeantRequested,
  isAcrSatisfied,
  isThereAnyRequestedAcr,
  twoFactorsAuthRequested,
} from "../services/acr-checks";
import { oidcErrorSchema } from "../services/custom-zod-schemas";
import epochTime from "../services/epoch-time";
import { mustReturnOneOrganizationInPayload } from "../services/must-return-one-organization-in-payload";

export const interactionStartControllerFactory =
  (oidcProvider: Provider) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        uid: interactionId,
        params,
        prompt,
      } = await oidcProvider.interactionDetails(req, res);
      const { client_id, login_hint, scope } = params as OIDCContextParams;

      req.session.interactionId = interactionId;
      req.session.mustReturnOneOrganizationInPayload =
        mustReturnOneOrganizationInPayload(scope);
      req.session.twoFactorsAuthRequested = twoFactorsAuthRequested(prompt);
      req.session.certificationDirigeantRequested =
        certificationDirigeantRequested(prompt);

      const oidcClient = await findByClientId(client_id);
      req.session.authForProconnectFederation =
        oidcClient?.is_proconnect_federation;

      if (login_hint) {
        setLoginHintInUnauthenticatedSession(req, login_hint);
      }

      if (prompt.name === "login" && prompt.reasons.includes("login_prompt")) {
        return res.redirect(`/users/start-sign-in`);
      }

      if (prompt.name === "login" || prompt.name === "choose_organization") {
        if (
          login_hint &&
          isWithinAuthenticatedSession(req.session) &&
          getUserFromAuthenticatedSession(req).email !== login_hint
        ) {
          return res.redirect(`/users/start-sign-in`);
        }

        return res.redirect(`/interaction/${interactionId}/login`);
      }

      // Skip consent interaction since application consent is always granted
      // Support for prompt=consent is still required by the spec.
      if (prompt.name === "consent") {
        return res.redirect(`/interaction/${interactionId}/login`);
      }

      if (prompt.name === "select_organization") {
        return res.redirect(`/users/select-organization`);
      }

      if (prompt.name === "update_userinfo") {
        return res.redirect(`/users/personal-information`);
      }

      return next(new Error(`unknown_interaction_name ${prompt.name}`));
    } catch (error) {
      return next(error);
    }
  };

export const interactionEndControllerFactory =
  (oidcProvider: Provider) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getUserFromAuthenticatedSession(req);

      const isConsistencyChecked = await isIdentityConsistencyChecked(req);

      let currentAcr = isWithinTwoFactorAuthenticatedSession(req)
        ? isConsistencyChecked
          ? ACR_VALUE_FOR_IAL2_AAL2
          : ACR_VALUE_FOR_IAL1_AAL2
        : isConsistencyChecked
          ? ACR_VALUE_FOR_IAL2_AAL1
          : ACR_VALUE_FOR_IAL1_AAL1;

      currentAcr = req.session.certificationDirigeantRequested
        ? ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT
        : currentAcr;

      const amr = getSessionStandardizedAuthenticationMethodsReferences(req);
      const ts = user.last_sign_in_at
        ? epochTime(user.last_sign_in_at)
        : undefined;

      const { prompt } = await oidcProvider.interactionDetails(req, res);

      if (
        FEATURE_ALWAYS_RETURN_EIDAS1_FOR_ACR &&
        !isThereAnyRequestedAcr(prompt)
      ) {
        currentAcr = "eidas1";
      }

      let result: OidcInteractionResults = {
        login: {
          accountId: user.id.toString(),
          acr: currentAcr,
          amr,
          ts,
        },
        select_organization: false,
        update_userinfo: false,
        // skip the consent
        consent: {},
      };
      if (prompt.name === "select_organization") {
        result.select_organization = true;
      }

      if (prompt.name === "update_userinfo") {
        result.update_userinfo = true;
      }

      if (!isAcrSatisfied(prompt, currentAcr)) {
        return next(
          new OidcError(
            "access_denied",
            "none of the requested ACRs could be obtained",
          ),
        );
      }

      req.session.interactionId = undefined;
      req.session.mustReturnOneOrganizationInPayload = undefined;
      req.session.twoFactorsAuthRequested = undefined;
      req.session.authForProconnectFederation = undefined;

      await oidcProvider.interactionFinished(req, res, result);
    } catch (error) {
      if (error instanceof errors.SessionNotFound) {
        // we may have taken to long to provide a session to the user since he has been redirected
        // we fail silently
        return res.redirect("/");
      }

      next(error);
    }
  };

export const interactionErrorControllerFactory =
  (oidcProvider: Provider) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.session.interactionId = undefined;
      req.session.mustReturnOneOrganizationInPayload = undefined;
      req.session.twoFactorsAuthRequested = undefined;
      req.session.authForProconnectFederation = undefined;

      const schema = z.object({
        error: oidcErrorSchema(),
      });

      const { error } = await schema.parseAsync(req.query);

      await oidcProvider.interactionFinished(req, res, { error });
    } catch (error) {
      next(error);
    }
  };
