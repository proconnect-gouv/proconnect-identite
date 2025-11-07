import {
  ApiEntrepriseConnectionError,
  ApiEntrepriseError,
} from "@proconnect-gouv/proconnect.api_entreprise/types";
import {
  InvalidSiretError,
  NotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
import * as Sentry from "@sentry/node";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { inspect } from "node:util";
import { z, ZodError } from "zod";
import notificationMessages from "../config/notification-messages";
import { InseeApiRepository } from "../connectors/api-insee";
import { RegistreNationalEntreprisesApiRepository } from "../connectors/api-rne";
import { getOrganizationInfo } from "../connectors/api-sirene";
import { sendModerationProcessedEmail } from "../managers/moderation";
import { forceJoinOrganization } from "../managers/organization/join";
import { getUserOrganizationLink } from "../repositories/organization/getters";
import {
  idSchema,
  optionalBooleanSchema,
  siretSchema,
} from "../services/custom-zod-schemas";
import { logger } from "../services/log";

export const getPingApiSireneController = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    await getOrganizationInfo("13002526500013"); // we use DINUM siret for the ping route

    return res.json({});
  } catch (e) {
    logger.error(inspect(e, { depth: 3 }));
    Sentry.captureException(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
};

export async function getPingApiInseeController(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  try {
    await InseeApiRepository.findBySiret("13002526500013"); // we use DINUM siret for the ping route
    return res.json({});
  } catch (e) {
    logger.error(inspect(e, { depth: 3 }));
    Sentry.captureException(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
}

export async function getPingApiRegistreNationalEntreprisesController(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  try {
    // we use Douglas DUTEIL (ONEDOES.DRAW.DOUBLEACE) siren for the ping route
    // because DINUM siren is returned as 404 by the RNE API
    await RegistreNationalEntreprisesApiRepository.findPouvoirsBySiren(
      "828696252",
    );
    return res.json({});
  } catch (e) {
    logger.error(inspect(e, { depth: 3 }));
    Sentry.captureException(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
}

export const getOrganizationInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      siret: siretSchema(),
    });

    const { siret } = await schema.parseAsync(req.params);

    const organizationInfo = await getOrganizationInfo(siret);

    return res.json({ organizationInfo });
  } catch (e) {
    if (e instanceof InvalidSiretError) {
      return next(
        new HttpErrors.BadRequest(
          notificationMessages["invalid_siret"].description,
        ),
      );
    }

    if (e instanceof NotFoundError) {
      return next(new HttpErrors.NotFound());
    }

    if (e instanceof ApiEntrepriseConnectionError) {
      return next(
        new HttpErrors.GatewayTimeout(
          notificationMessages["insee_unexpected_error"].description,
        ),
      );
    }

    if (e instanceof ApiEntrepriseError) {
      return next(
        new HttpErrors.BadRequest(
          notificationMessages["invalid_siret"].description,
        ),
      );
    }

    if (e instanceof ZodError) {
      return next(
        new HttpErrors.BadRequest(
          notificationMessages["invalid_siret"].description,
        ),
      );
    }

    next(e);
  }
};

export const postForceJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
      user_id: idSchema(),
      is_external: optionalBooleanSchema(),
    });

    const { organization_id, user_id, is_external } = await schema.parseAsync(
      req.query,
    );

    let userOrganizationLink = await getUserOrganizationLink(
      organization_id,
      user_id,
    );
    if (!userOrganizationLink) {
      userOrganizationLink = await forceJoinOrganization({
        organization_id,
        user_id,
        is_external,
      });
    }

    return res.json({});
  } catch (e) {
    if (e instanceof ZodError) {
      return next(new HttpErrors.BadRequest());
    }

    next(e);
  }
};

export const postSendModerationProcessedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
      user_id: idSchema(),
    });

    const { organization_id, user_id } = await schema.parseAsync(req.query);

    await sendModerationProcessedEmail({ organization_id, user_id });

    return res.json({});
  } catch (e) {
    logger.error(e);
    if (e instanceof ZodError) {
      return next(new HttpErrors.BadRequest());
    }

    if (e instanceof NotFoundError) {
      return next(new HttpErrors.NotFound());
    }

    next(e);
  }
};
