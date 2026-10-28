import * as Sentry from "@sentry/node";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { match } from "ts-pattern";
import { z } from "zod";
import notificationMessages from "../config/notification-messages";
import { pingAnnuaireEducationNationale } from "../connectors/api-annuaire-education-nationale";
import { ApiEntrepriseClient } from "../connectors/api-entreprise";
import { ApiInseeClient } from "../connectors/api-insee";
import { ApiRegistreNationalEntreprisesClient } from "../connectors/api-rne";
import { pingDebounceApi } from "../connectors/debounce";
import { pingGithubPasskeyAuthenticatorAaguids } from "../connectors/github-passkey-authenticator-aaguids";
import { getOrganizationInfo } from "../connectors/organization-info";
import { pingPwnedPasswords } from "../connectors/pwnedpasswords";
import { siretSchema } from "../services/custom-zod-schemas";
import { logger } from "../services/log";

export const getPingApiEntrepriseController = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    await ApiEntrepriseClient.findBySiret("13002526500013"); // we use DINUM siret for the ping route

    return res.json({});
  } catch (e) {
    logger.error(e);
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
    await ApiInseeClient.findBySiret("13002526500013"); // we use DINUM siret for the ping route
    return res.json({});
  } catch (e) {
    logger.error(e);
    Sentry.captureException(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
}

export async function getPingApiDebounceController(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  try {
    await pingDebounceApi();
    return res.json({});
  } catch (e) {
    logger.error(e);
    Sentry.captureException(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
}

export async function getPingPwnedPasswordsController(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  try {
    await pingPwnedPasswords(); // we use a mock password for the ping route
    return res.json({});
  } catch (e) {
    logger.error(e);
    Sentry.captureException(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
}

export async function getPingGithubPasskeyAuthenticatorAaguidsController(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  try {
    await pingGithubPasskeyAuthenticatorAaguids();
    return res.json({});
  } catch (e) {
    logger.error(e);
    Sentry.captureException(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
}

export async function getPingApiAnnuaireEducationNationaleController(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  try {
    await pingAnnuaireEducationNationale(); // we use a mock siret for the ping route
    return res.json({});
  } catch (e) {
    logger.error(e);
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
    await ApiRegistreNationalEntreprisesClient.findPouvoirsBySiren("828696252");
    return res.json({});
  } catch (e) {
    logger.error(e);
    Sentry.captureException(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
}

export const getOrganizationInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const params = z.object({ siret: siretSchema() }).safeParse(req.params);
  if (!params.success) {
    return next(
      new HttpErrors.BadRequest(
        notificationMessages["invalid_siret"].description,
      ),
    );
  }
  const { siret } = params.data;

  return match(await getOrganizationInfo(siret))
    .with({ kind: "api_entreprise_failed" }, () =>
      next(
        new HttpErrors.GatewayTimeout(
          notificationMessages["insee_unexpected_error"].description,
        ),
      ),
    )
    .with({ kind: "found" }, ({ organization_info, rne }) => {
      if (rne.kind === "failed") {
        logger.warn("api_rne.company_request.failed", { siret }, rne.exception);
      }
      return res.json({ organizationInfo: organization_info });
    })
    .with({ kind: "invalid_siret" }, () =>
      next(
        new HttpErrors.BadRequest(
          notificationMessages["invalid_siret"].description,
        ),
      ),
    )
    .with({ kind: "not_diffusible" }, () => next(new HttpErrors.NotFound()))
    .exhaustive();
};
