import type { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash-es";
import {
  ApiAnnuaireConnectionError,
  ApiAnnuaireNotFoundError,
} from "../../config/errors";
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
      req.session.pendingOfficialContactEmailVerificationOrganizationId;
    if (organization_id === undefined) {
      return res.redirect(
        `/users/join-organization?notification=official_contact_email_verification_not_found`,
      );
    }

    const organization = await organizations.findById(organization_id);
    if (isEmpty(organization)) {
      req.session.pendingOfficialContactEmailVerificationOrganizationId =
        undefined;
      return res.redirect(
        `/users/join-organization?notification=organization_not_found`,
      );
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

    if (error instanceof ApiAnnuaireConnectionError) {
      return res.redirect(
        `/users/join-organization?notification=api_annuaire_error`,
      );
    }

    if (error instanceof ApiAnnuaireNotFoundError) {
      return res.redirect(
        `/users/join-organization?notification=api_annuaire_contact_email_not_found`,
      );
    }

    next(error);
  }
};
