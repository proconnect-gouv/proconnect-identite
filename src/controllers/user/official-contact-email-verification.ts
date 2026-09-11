import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { z } from "zod";
import {
  ApiAnnuaireError,
  InvalidTokenError,
  OfficialContactEmailVerificationNotNeededError,
} from "../../config/errors";
import { context } from "../../connectors/context";
import { selectOrganization } from "../../managers/organization/main";
import {
  sendOfficialContactEmailVerificationEmail,
  verifyOfficialContactEmailToken,
} from "../../managers/organization/official-contact-email-verification";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  officialContactEmailVerificationTokenSchema,
  optionalBooleanSchema,
} from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import { getOrganizationTypeLabel } from "../../services/organization";

const { organizations } = context.repository;

export const getOfficialContactEmailVerificationController = async (
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

    const schema = z.object({
      query: z.object({
        contact_email: z.email().optional(),
        new_code_sent: optionalBooleanSchema(),
      }),
    });

    const {
      query: { new_code_sent, contact_email },
    } = await schema.parseAsync({
      query: req.query,
    });

    const { codeSent, contactEmail, libelle } =
      await sendOfficialContactEmailVerificationEmail({
        user_id: getUserFromAuthenticatedSession(req).id,
        organization_id,
        checkBeforeSend: true,
        selectedContactEmail: contact_email,
      });

    return res.render("user/official-contact-email-verification", {
      pageTitle: "Vérifier votre email",
      notifications: await getNotificationsFromRequest(req),
      contactEmail,
      csrfToken: csrfToken(req),
      newCodeSent: new_code_sent,
      codeSent,
      libelle,
      organization_id,
      organization_type_label: getOrganizationTypeLabel(organization),
    });
  } catch (error) {
    req.session.pendingOfficialContactEmailVerificationOrganizationId =
      undefined;
    if (error instanceof OfficialContactEmailVerificationNotNeededError) {
      return res.redirect(
        `/users/join-organization?notification=official_contact_email_verification_not_needed`,
      );
    }

    if (error instanceof ApiAnnuaireError) {
      return res.redirect(
        `/users/join-organization?notification=api_annuaire_error`,
      );
    }

    next(error);
  }
};

export const postOfficialContactEmailVerificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);
    const organization_id =
      req.session.pendingOfficialContactEmailVerificationOrganizationId!;
    const organization = await organizations.findById(organization_id);
    if (isEmpty(organization)) {
      throw HttpErrors.NotFound();
    }

    const schema = z.object({
      body: z.object({
        official_contact_email_verification_token:
          officialContactEmailVerificationTokenSchema(),
      }),
    });

    const {
      body: { official_contact_email_verification_token },
    } = await schema.parseAsync({
      body: req.body,
    });

    await verifyOfficialContactEmailToken({
      user_id: getUserFromAuthenticatedSession(req).id,
      organization_id,
      token: official_contact_email_verification_token,
    });

    req.session.pendingOfficialContactEmailVerificationOrganizationId =
      undefined;

    await selectOrganization({
      user_id,
      organization_id,
    });

    return next();
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      return res.redirect(
        `/users/official-contact-email-verification?notification=invalid_verify_email_code`,
      );
    }

    req.session.pendingOfficialContactEmailVerificationOrganizationId =
      undefined;

    next(error);
  }
};
