import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash-es";
import { z } from "zod";
import { LinkEnum } from "../../../packages/identite/src/types";
import { context } from "../../connectors/context";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import { getSelectedOrganizationId } from "../../repositories/redis/selected-organization";
import { optionalBooleanSchema } from "../../services/custom-zod-schemas";

const { franceconnect_userinfo, organizations, users_organizations } =
  context.repository;

export const getWelcomeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      show_inclusion_connect_onboarding_help: optionalBooleanSchema(),
    });

    const { show_inclusion_connect_onboarding_help } = await schema.parseAsync(
      req.query,
    );

    let user = getUserFromAuthenticatedSession(req);

    let selectedOrganizationId = await getSelectedOrganizationId(user.id);

    if (selectedOrganizationId === null) {
      return res.render("user/welcome", {
        pageTitle: "Compte créé",
        csrfToken: csrfToken(req),
        show_inclusion_connect_onboarding_help,
        organization: null,
        user: {
          email: user.email,
          family_name: user.family_name,
          given_name: user.given_name,
        },
      });
    }

    const userOrganisation = await organizations.getById(
      selectedOrganizationId,
    );

    const organization = {
      libelle: userOrganisation.cached_libelle,
      siret: userOrganisation.siret,
      adresse: userOrganisation.cached_adresse,
      siege_social: userOrganisation.cached_siege_social,
    };

    const link = await users_organizations.get({
      user_id: user.id,
      organization_id: selectedOrganizationId,
    });

    if (link.verification_type !== LinkEnum.enum.organization_dirigeant) {
      return res.render("user/welcome", {
        pageTitle: "Compte créé",
        csrfToken: csrfToken(req),
        show_inclusion_connect_onboarding_help,
        organization,
        user: {
          email: user.email,
          family_name: user.family_name,
          given_name: user.given_name,
        },
      });
    }

    const user_info = await franceconnect_userinfo.find(user.id);

    if (isEmpty(user_info))
      throw new NotFoundError("FranceConnect User info not found");

    const formattedBirthDate = new Date(user_info.birthdate).toLocaleDateString(
      "fr-FR",
    );
    return res.render("user/welcome-dirigeant", {
      pageTitle: "Compte certifié",
      csrfToken: csrfToken(req),
      show_inclusion_connect_onboarding_help,
      organization,
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
