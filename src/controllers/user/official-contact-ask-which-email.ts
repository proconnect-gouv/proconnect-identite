import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { z } from "zod";
import { ApiAnnuaireError } from "../../config/errors";
import { getAnnuaireServicePublicContactEmails } from "../../connectors/api-annuaire-service-public";
import { getOrganizationById } from "../../managers/organization/main";
import { csrfToken } from "../../middlewares/csrf-protection";
import { idSchema } from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import { getOrganizationTypeLabel } from "../../services/organization";

export const getOfficialContactAskWhichEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      params: z.object({
        organization_id: idSchema(),
      }),
    });

    const {
      params: { organization_id },
    } = await schema.parseAsync({
      query: req.query,
      params: req.params,
    });
    const organization = await getOrganizationById(organization_id);

    if (isEmpty(organization)) {
      throw HttpErrors.NotFound();
    }

    const contactEmails = await getAnnuaireServicePublicContactEmails(
      organization.cached_code_officiel_geographique,
      organization.cached_code_postal,
    );

    return res.render("user/official-contact-ask-which-email", {
      pageTitle: "Vérifier votre email",
      notifications: await getNotificationsFromRequest(req),
      contactEmails,
      csrfToken: csrfToken(req),
      organization_id,
      organization_type_label: getOrganizationTypeLabel(organization),
    });
  } catch (error) {
    if (error instanceof ApiAnnuaireError) {
      return res.redirect(
        `/users/join-organization?notification=api_annuaire_error`,
      );
    }

    next(error);
  }
};
