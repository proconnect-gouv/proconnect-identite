import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash-es";
import { getOrganizationById } from "../../managers/organization/main";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import { getSelectedOrganizationId } from "../../repositories/redis/selected-organization";
import { getFranceConnectUserInfo, update } from "../../repositories/user";

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

    let selectedOrganizationId = await getSelectedOrganizationId(user.id);

    let organization = null;

    if (selectedOrganizationId !== null) {
      const userOrganisation = await getOrganizationById(
        selectedOrganizationId,
      );

      if (!userOrganisation)
        throw new NotFoundError("User in organization not found");

      organization = {
        libelle: userOrganisation.cached_libelle,
        siret: userOrganisation.siret,
        adresse: userOrganisation.cached_adresse,
      };
    }

    return res.render("user/welcome", {
      pageTitle: "Compte créé",
      csrfToken: csrfToken(req),
      showInclusionConnectOnboardingHelp,
      organization,
      user: {
        email: user.email,
        family_name: user.family_name,
        given_name: user.given_name,
      },
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
    if (selectedOrganizationId === null)
      throw new NotFoundError("Selected organization not found");

    const userOrganisations = await getOrganizationById(selectedOrganizationId);

    if (!userOrganisations)
      throw new NotFoundError("User in organization not found");

    const user_info = await getFranceConnectUserInfo(user.id);

    if (isEmpty(user_info))
      throw new NotFoundError("FranceConnect User info not found");

    const formattedBirthDate = new Date(user_info.birthdate).toLocaleDateString(
      "fr-FR",
    );
    return res.render("user/welcome-dirigeant", {
      pageTitle: "Compte certifié",
      csrfToken: csrfToken(req),
      showInclusionConnectOnboardingHelp,
      organization: {
        libelle: userOrganisations.cached_libelle,
        adresse: userOrganisations.cached_adresse,
        siret: userOrganisations.siret,
      },
      user: {
        email: user.email,
        family_name: user.family_name,
        given_name: user.given_name,
        formattedBirthDate,
        birthPlace: user_info.birthplace,
        gender: user_info.gender,
      },
    });
  } catch (error) {
    next(error);
  }
};
