import { NotFoundError } from "@gouvfr-lasuite/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { getOrganizationById } from "../../managers/organization/main";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import { getSelectedOrganizationId } from "../../repositories/redis/selected-organization";
import { update } from "../../repositories/user";

export const getWelcomeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user = getUserFromAuthenticatedSession(req);
    const showInclusionConnectOnboardingHelp =
      user.needs_inclusionconnect_onboarding_help;
    user = await update(user.id, {
      needs_inclusionconnect_onboarding_help: false,
    });
    updateUserInAuthenticatedSession(req, user);

    if (req.session.certificationDirigeantRequested) {
      const selectedOrganizationId = await getSelectedOrganizationId(
        getUserFromAuthenticatedSession(req).id,
      );
      if (selectedOrganizationId === null) return next();
      const userOrganisations = await getOrganizationById(
        selectedOrganizationId,
      );
      if (!userOrganisations)
        throw new NotFoundError("User in organization not found");

      return res.render("user/welcome-executive", {
        pageTitle: "Compte certifié",
        csrfToken: csrfToken(req),
        illustration: "illu-support.svg",
        showInclusionConnectOnboardingHelp,
        organization: { libelle: userOrganisations.cached_libelle },
        user: {
          email: user.email,
          family_name: user.family_name,
          given_name: user.given_name,
          job: user.job,
        },
      });
    }

    return res.render("user/welcome", {
      pageTitle: "Compte créé",
      csrfToken: csrfToken(req),
      illustration: "illu-support.svg",
      showInclusionConnectOnboardingHelp,
    });
  } catch (error) {
    next(error);
  }
};

export const getWelcomeDirigeantController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user = getUserFromAuthenticatedSession(req);
    const showInclusionConnectOnboardingHelp =
      user.needs_inclusionconnect_onboarding_help;
    user = await update(user.id, {
      needs_inclusionconnect_onboarding_help: false,
    });
    updateUserInAuthenticatedSession(req, user);

    const selectedOrganizationId = await getSelectedOrganizationId(
      getUserFromAuthenticatedSession(req).id,
    );
    if (selectedOrganizationId === null) return next();

    const userOrganisations = await getOrganizationById(selectedOrganizationId);
    if (!userOrganisations)
      throw new NotFoundError("User in organization not found");

    return res.render("user/welcome-dirigeant", {
      pageTitle: "Compte certifié",
      csrfToken: csrfToken(req),
      illustration: "illu-support.svg",
      showInclusionConnectOnboardingHelp,
      organization: { libelle: userOrganisations.cached_libelle },
      user: {
        email: user.email,
        family_name: user.family_name,
        given_name: user.given_name,
        job: user.job,
      },
    });
  } catch (error) {
    next(error);
  }
};
