import type { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash-es";
import {
  ApiAnnuaireConnectionError,
  ApiAnnuaireNotFoundError,
} from "../../config/errors";
import { getAnnuaireServicePublicContactEmails } from "../../connectors/api-annuaire-service-public";
import { context } from "../../connectors/context";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import { track } from "../../services/log";
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
      track("official_contact.verification.missing", {
        user_id: getUserFromAuthenticatedSession(req).id,
      });
      return res.redirect(
        `/users/join-organization?notification=official_contact_email_verification_not_found`,
      );
    }

    const organization = await organizations.findById(organization_id);
    if (isEmpty(organization)) {
      track("official_contact.organization.not_found", { organization_id });
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
    const organization_id =
      req.session.pendingOfficialContactEmailVerificationOrganizationId;
    req.session.pendingOfficialContactEmailVerificationOrganizationId =
      undefined;

    if (error instanceof ApiAnnuaireConnectionError) {
      track("official_contact.annuaire.unavailable", {
        organization_id,
        "error.type": error.name,
      });
      return res.redirect(
        `/users/join-organization?notification=api_annuaire_error`,
      );
    }

    if (error instanceof ApiAnnuaireNotFoundError) {
      track("official_contact.annuaire.contact_email_not_found", {
        organization_id,
      });
      return res.redirect(
        `/users/join-organization?notification=api_annuaire_contact_email_not_found`,
      );
    }

    next(error);
  }
};
