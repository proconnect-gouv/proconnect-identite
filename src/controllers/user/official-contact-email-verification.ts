import type { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash-es";
import { match, P } from "ts-pattern";
import { z } from "zod";
import {
  ApiAnnuaireError,
  ApiAnnuaireNotFoundError,
  InvalidTokenError,
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
import { track } from "../../services/log";
import { getOrganizationTypeLabel } from "../../services/organization";

const { organizations } = context.repository;

export const getOfficialContactEmailVerificationController = async (
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

    const schema = z.object({
      query: z.object({
        contact_email: z.string().optional(),
        new_code_sent: optionalBooleanSchema(),
      }),
    });

    const result = await schema.safeParseAsync({
      query: req.query,
    });
    if (!result.success) {
      track("official_contact.page_query.invalid", { error: result.error });
      return res.redirect(
        `/users/official-contact-ask-which-email?notification=invalid_email`,
      );
    }

    const {
      query: { new_code_sent, contact_email },
    } = result.data;

    const outcome = await sendOfficialContactEmailVerificationEmail({
      user_id: getUserFromAuthenticatedSession(req).id,
      organization_id,
      checkBeforeSend: true,
      selectedContactEmail: contact_email,
    });

    if (outcome.kind !== "verification_pending") {
      return match(outcome)
        .with({ kind: "not_needed" }, () => {
          req.session.pendingOfficialContactEmailVerificationOrganizationId =
            undefined;
          return res.redirect(
            `/users/join-organization?notification=official_contact_email_verification_not_needed`,
          );
        })
        .with(
          {
            kind: P.union(
              "contact_email_choice_needed",
              "contact_email_mismatch",
            ),
          },
          () => res.redirect(`/users/official-contact-ask-which-email`),
        )
        .exhaustive();
    }

    const { codeSent, contactEmail, libelle } = outcome;

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
    const organization_id =
      req.session.pendingOfficialContactEmailVerificationOrganizationId;
    req.session.pendingOfficialContactEmailVerificationOrganizationId =
      undefined;

    if (
      error instanceof ApiAnnuaireError &&
      error.cause instanceof ApiAnnuaireNotFoundError
    ) {
      track("official_contact.annuaire.contact_email_not_found", {
        organization_id,
      });
      return res.redirect(
        `/users/join-organization?notification=api_annuaire_contact_email_not_found`,
      );
    }

    if (error instanceof ApiAnnuaireError) {
      track("official_contact.annuaire.unavailable", {
        organization_id,
        "error.type":
          error.cause instanceof Error ? error.cause.name : error.name,
      });
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

    const schema = z.object({
      body: z.object({
        official_contact_email_verification_token:
          officialContactEmailVerificationTokenSchema(),
      }),
    });

    const result = await schema.safeParseAsync({
      body: req.body,
    });
    if (!result.success) {
      track("official_contact.code.invalid_format", { error: result.error });
      return res.redirect(
        `/users/official-contact-email-verification?notification=invalid_verify_email_code`,
      );
    }

    const {
      body: { official_contact_email_verification_token },
    } = result.data;

    await verifyOfficialContactEmailToken({
      user_id: getUserFromAuthenticatedSession(req).id,
      organization_id,
      token: official_contact_email_verification_token,
    });

    req.session.pendingOfficialContactEmailVerificationOrganizationId =
      undefined;

    await selectOrganization({ req, organization_id });

    req.session.pendingGreetingsForSelectedOrganization = true;

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
