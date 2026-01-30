import { to } from "await-to-js";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  ApiAnnuaireError,
  InvalidTokenError,
  OfficialContactEmailVerificationNotNeededError,
} from "../../config/errors";
import { getOrganizationById } from "../../managers/organization/main";
import {
  sendOfficialContactEmailVerificationEmail,
  verifyOfficialContactEmailToken,
} from "../../managers/organization/official-contact-email-verification";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  idSchema,
  officialContactEmailVerificationTokenSchema,
  optionalBooleanSchema,
} from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import { getOrganizationTypeLabel } from "../../services/organization";

export const getOfficialContactEmailVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      query: z.object({
        contact_email: z.email().optional(),
        new_code_sent: optionalBooleanSchema(),
      }),
      params: z.object({
        organization_id: idSchema(),
      }),
    });

    const {
      query: { new_code_sent, contact_email },
      params: { organization_id },
    } = await schema.parseAsync({
      query: req.query,
      params: req.params,
    });

    const { codeSent, contactEmail, libelle } =
      await sendOfficialContactEmailVerificationEmail({
        user_id: getUserFromAuthenticatedSession(req).id,
        organization_id,
        checkBeforeSend: true,
        selectedContactEmail: contact_email,
      });

    // call to sendOfficialContactEmailVerificationEmail ensure organization exists
    const organization = (await getOrganizationById(organization_id))!;

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
    const schema = z.object({
      body: z.object({
        official_contact_email_verification_token:
          officialContactEmailVerificationTokenSchema(),
      }),
      params: z.object({
        organization_id: idSchema(),
      }),
    });

    const {
      body: { official_contact_email_verification_token },
      params: { organization_id },
    } = await schema.parseAsync({
      body: req.body,
      params: req.params,
    });

    const [error] = await to(
      verifyOfficialContactEmailToken({
        user_id: getUserFromAuthenticatedSession(req).id,
        organization_id,
        token: official_contact_email_verification_token,
      }),
    );

    if (error instanceof InvalidTokenError) {
      return res.redirect(
        `/users/official-contact-email-verification/${organization_id}?notification=invalid_verify_email_code`,
      );
    } else if (error) {
      return next(error);
    }

    return next();
  } catch (error) {
    next(error);
  }
};
