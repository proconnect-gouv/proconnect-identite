import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { ApiAnnuaireError } from "../../config/errors";
import { getAnnuaireServicePublicContactEmails } from "../../connectors/api-annuaire-service-public";
import { context } from "../../connectors/context";
import { csrfToken } from "../../middlewares/csrf-protection";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import { getOrganizationTypeLabel } from "../../services/organization";

const { organizations } = context.repository;

export const getOfficialContactAskWhichEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization_id =
      req.session.pendingOfficialContactEmailVerificationOrganizationId!;
    const organization = await organizations.findById(organization_id);
    if (isEmpty(organization)) {
      throw HttpErrors.NotFound();
    }

    const contactEmails = await getAnnuaireServicePublicContactEmails(
      organization.cached_code_officiel_geographique,
    );

    return res.render("user/official-contact-ask-which-email", {
      pageTitle: "Vérifier votre email",
      notifications: await getNotificationsFromRequest(req),
      contactEmails,
      csrfToken: csrfToken(req),
      organization_type_label: getOrganizationTypeLabel(organization),
    });
  } catch (error) {
    req.session.pendingOfficialContactEmailVerificationOrganizationId =
      undefined;
    if (error instanceof ApiAnnuaireError) {
      return res.redirect(
        `/users/join-organization?notification=api_annuaire_error`,
      );
    }

    next(error);
  }
};
