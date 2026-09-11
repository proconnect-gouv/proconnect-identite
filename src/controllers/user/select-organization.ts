import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { context } from "../../connectors/context";
import { selectOrganization } from "../../managers/organization/main";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import { idSchema } from "../../services/custom-zod-schemas";

const { organizations } = context.repository;

export const getSelectOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userOrganizations = await organizations.findByUserId(
      getUserFromAuthenticatedSession(req).id,
    );

    return res.render("user/select-organization", {
      pageTitle: "Choisir une organisation",
      userOrganizations,
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postSelectOrganizationMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
    });
    const { organization_id } = await schema.parseAsync(req.body);

    await selectOrganization({
      user_id: getUserFromAuthenticatedSession(req).id,
      organization_id,
    });

    return next();
  } catch (error) {
    next(error);
  }
};
