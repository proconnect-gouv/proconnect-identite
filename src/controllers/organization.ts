import { getEmailDomain } from "@gouvfr-lasuite/proconnect.core/services/email";
import { EntrepriseApiError } from "@gouvfr-lasuite/proconnect.entreprise/types";
import { DOMAINS_WHITELIST } from "@gouvfr-lasuite/proconnect.identite/data/organization";
import {
  InvalidCertificationError,
  InvalidSiretError,
  NotFoundError,
  OrganizationNotActiveError,
} from "@gouvfr-lasuite/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { z, ZodError } from "zod";
import {
  AccessRestrictedToPublicServiceEmailError,
  DomainRestrictedError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserModerationRejectedError,
  UserMustConfirmToJoinOrganizationError,
} from "../config/errors";
import { getOrganizationFromModeration } from "../managers/moderation";
import {
  doSuggestOrganizations,
  getOrganizationSuggestions,
  joinOrganization,
} from "../managers/organization/join";
import {
  getOrganizationById,
  quitOrganization,
  selectOrganization,
} from "../managers/organization/main";
import { getUserFromAuthenticatedSession } from "../managers/session/authenticated";
import { csrfToken } from "../middlewares/csrf-protection";
import { getModerationById } from "../repositories/moderation";
import {
  idSchema,
  oidcErrorSchema,
  optionalBooleanSchema,
  siretSchema,
} from "../services/custom-zod-schemas";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import hasErrorFromField from "../services/has-error-from-field";
import {
  allowsPersonalInfoEditing,
  extractRejectionReason,
} from "../services/moderation";

export const getJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      siret_hint: z.string().optional(),
      notification: z.string().optional(),
      do_not_propose_suggestions: optionalBooleanSchema(),
    });

    const { notification, siret_hint, do_not_propose_suggestions } =
      await schema.parseAsync(req.query);

    const { id: user_id, email } = getUserFromAuthenticatedSession(req);

    if (
      !siret_hint &&
      !notification &&
      !do_not_propose_suggestions &&
      (await doSuggestOrganizations({ user_id, email }))
    ) {
      return res.redirect("/users/organization-suggestions");
    }

    return res.render("user/join-organization", {
      pageTitle: "Rejoindre une organisation",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      siretHint: siret_hint,
      useGendarmerieSearchHint:
        getEmailDomain(email) === "gendarmerie.interieur.gouv.fr",
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationSuggestionsController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id: user_id, email } = getUserFromAuthenticatedSession(req);

  const organizationSuggestions = await getOrganizationSuggestions({
    user_id,
    email,
  });

  return res.render("user/organization-suggestions", {
    pageTitle: "Votre organisation de rattachement",
    organizationSuggestions,
    csrfToken: csrfToken(req),
  });
};

export const postJoinOrganizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      confirmed: optionalBooleanSchema(),
      siret: siretSchema(),
    });

    const { confirmed, siret } = await schema.parseAsync(req.body);
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const userOrganizationLink = await joinOrganization({
      siret,
      user_id,
      confirmed,
      certificationRequested: req.session.certificationDirigeantRequested,
    });

    if (req.session.mustReturnOneOrganizationInPayload) {
      await selectOrganization({
        user_id,
        organization_id: userOrganizationLink.organization_id,
      });
    }

    next();
  } catch (error) {
    if (error instanceof InvalidCertificationError) {
      return res.redirect("/users/unable-to-certify-user-as-executive");
    }

    if (
      error instanceof UnableToAutoJoinOrganizationError ||
      error instanceof UserAlreadyAskedToJoinOrganizationError
    ) {
      return res.redirect(
        `/users/unable-to-auto-join-organization?moderation_id=${error.moderationId}`,
      );
    }

    if (error instanceof UserModerationRejectedError) {
      return res.redirect(
        `/users/moderation-rejected?moderation_id=${error.moderationId}`,
      );
    }

    if (error instanceof AccessRestrictedToPublicServiceEmailError) {
      return res.redirect(`/users/access-restricted-to-public-sector-email`);
    }

    if (error instanceof DomainRestrictedError) {
      return res.redirect(
        `/users/domains-restricted-in-organization?organization_id=${error.organizationId}`,
      );
    }

    if (
      error instanceof InvalidSiretError ||
      error instanceof OrganizationNotActiveError ||
      (error instanceof ZodError && hasErrorFromField(error, "siret"))
    ) {
      return res.redirect(
        `/users/join-organization?notification=invalid_siret&siret_hint=${req.body.siret}`,
      );
    }

    if (error instanceof EntrepriseApiError) {
      return res.redirect(
        `/users/join-organization?notification=insee_unexpected_error&siret_hint=${req.body.siret}`,
      );
    }

    if (error instanceof UserInOrganizationAlreadyError) {
      return res.redirect(
        `/users/join-organization?notification=user_in_organization_already&siret_hint=${req.body.siret}`,
      );
    }

    if (error instanceof UserMustConfirmToJoinOrganizationError) {
      return res.redirect(
        `/users/join-organization-confirm?organization_id=${error.organizationId}`,
      );
    }

    next(error);
  }
};

export const getDomainsRestrictedInOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
    });

    const { organization_id } = await schema.parseAsync(req.query);

    const organization = await getOrganizationById(organization_id);
    if (isEmpty(organization)) {
      return next(new HttpErrors.NotFound());
    }
    const whitelist = DOMAINS_WHITELIST.get(organization.siret);
    if (!whitelist) {
      return next(new HttpErrors.NotFound());
    }

    return res.render("user/access-restricted-to-domains", {
      pageTitle: "Domains restreintes dans l'organisation",
      csrfToken: csrfToken(req),
      organization_label: organization.cached_libelle,
      organization_domains: whitelist.join(", "),
    });
  } catch (error) {
    next(error);
  }
};

export const getJoinOrganizationConfirmController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
    });

    const { organization_id } = await schema.parseAsync(req.query);

    const organization = await getOrganizationById(organization_id);

    if (isEmpty(organization)) {
      return next(new HttpErrors.NotFound());
    }

    return res.render("user/join-organization-confirm", {
      pageTitle: "Confirmer le rattachement",
      csrfToken: csrfToken(req),
      organization_label: organization.cached_libelle,
      email: getUserFromAuthenticatedSession(req).email,
      siret: organization.siret,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnableToAutoJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      moderation_id: idSchema(),
    });
    const { moderation_id } = await schema.parseAsync(req.query);
    const user = getUserFromAuthenticatedSession(req);

    const { cached_libelle } = await getOrganizationFromModeration({
      user,
      moderation_id,
    });

    return res.render("user/unable-to-auto-join-organization", {
      pageTitle: "Rattachement en cours",
      csrfToken: csrfToken(req),
      email: user.email,
      given_name: user.given_name,
      family_name: user.family_name,
      job: user.job,
      organization_label: cached_libelle,
      moderation_id,
    });
  } catch (e) {
    if (e instanceof NotFoundError) {
      next(new HttpErrors.NotFound());
    }
    next(e);
  }
};

export const getModerationRejectedController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      moderation_id: idSchema(),
    });
    const { moderation_id } = await schema.parseAsync(req.query);
    const user = getUserFromAuthenticatedSession(req);

    const { comment, user_id } = await getModerationById(moderation_id);

    if (user_id !== user.id) return next(new HttpErrors.NotFound());

    const { cached_libelle } = await getOrganizationFromModeration({
      user,
      moderation_id,
    });

    const rejectionReason = extractRejectionReason(comment);
    const allowEditing = allowsPersonalInfoEditing(rejectionReason);

    return res.render("user/moderation-rejected", {
      allowEditing,
      csrfToken: csrfToken(req),
      email: user.email,
      family_name: user.family_name,
      given_name: user.given_name,
      rejectionReason,
      illustration: "illu-support.svg",
      job: user.job,
      moderation_id,
      organization_label: cached_libelle,
      pageTitle: allowEditing ? "Informations à corriger" : "Demande refusée",
    });
  } catch (e) {
    if (e instanceof NotFoundError) {
      next(new HttpErrors.NotFound());
    }
    next(e);
  }
};

export function getUnableToCertifyUserAsExecutiveController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.render("user/unable-to-certify-user-as-executive", {
      illustration: "connection-lost.svg",
      oidcError: oidcErrorSchema().enum.login_required,
      interactionId: req.session.interactionId,
      pageTitle: "Certification impossible",
      use_dashboard_layout: false,
    });
  } catch (e) {
    next(e);
  }
}

export async function getAccessRestrictedToPublicSectorEmailController(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  return res.render("user/access-restricted-to-public-sector-email", {
    csrfToken: csrfToken(req),
    illustration: "connection-lost.svg",
    pageTitle: "Email non autorisé",
  });
}

export const postQuitUserOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      id: idSchema(),
    });

    const { id: organization_id } = await schema.parseAsync(req.params);

    await quitOrganization({
      user_id: getUserFromAuthenticatedSession(req).id,
      organization_id,
    });

    return res.redirect(
      `/manage-organizations?notification=quit_organization_success`,
    );
  } catch (error) {
    next(error);
  }
};
