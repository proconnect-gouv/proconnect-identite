import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { AuthorizationRequest } from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import type { Request } from "express";
import { isEmpty, isString } from "lodash-es";
import type { IncomingHttpHeaders } from "node:http";
import type { KoaContextWithOIDC } from "oidc-provider";
import { z } from "zod";
import { context } from "../connectors/context";
import { log_event, logger } from "../services/log";
import { oidcProviderAdapterFactory } from "../services/oidc-provider-adapter";

const { oidc_clients } = context.repository;

const StoredInteractionSchema = z.object({
  cid: z.string(),
  params: z.object({
    client_id: z.string(),
    sp_name: z.string().optional(),
  }),
});

export const recordAuthorizationRequest = async ({
  accountId,
  client,
  interactionCid,
  organizationId,
  outcome,
  params,
  requestHeaders,
}: {
  accountId: string;
  // workaround to extract the unexported Client type
  client: NonNullable<KoaContextWithOIDC["oidc"]["client"]>;
  interactionCid: string | null;
  organizationId: number | null;
  outcome: AuthorizationRequest["outcome"];
  params: OIDCContextParams;
  requestHeaders: IncomingHttpHeaders;
}): Promise<AuthorizationRequest> => {
  const user_id = parseInt(accountId, 10);

  const client_id = client.clientId;
  const oidc_client = await oidc_clients.findByClientId(client_id);
  if (isEmpty(oidc_client)) {
    throw new NotFoundError();
  }
  const oidc_client_id = oidc_client.id;

  let sp_name: string | null = null;
  if (isString(params?.sp_name)) {
    sp_name = params.sp_name;
  }

  const user_ip_address = requestHeaders["x-forwarded-for"]?.toString() || null;

  return await oidc_clients.upsertAuthorizationRequest({
    user_id,
    oidc_client_id,
    organization_id: organizationId,
    sp_name,
    user_ip_address,
    interaction_cid: interactionCid,
    outcome,
  });
};

export const recordAuthorizationRequestAtSignIn = async ({
  req,
  user_id,
}: {
  req: Request;
  user_id: number;
}) => {
  const { interactionId } = req.session;
  if (interactionId === undefined) {
    return;
  }

  try {
    const interaction = StoredInteractionSchema.safeParse(
      await oidcProviderAdapterFactory("Interaction").find(interactionId),
    );
    if (!interaction.success) {
      log_event("interaction.stored.not_found", {
        interaction_id: interactionId,
      });
      return;
    }

    const { cid, params } = interaction.data;
    const oidc_client = await oidc_clients.findByClientId(params.client_id);
    if (isEmpty(oidc_client)) {
      throw new NotFoundError();
    }

    await oidc_clients.upsertAuthorizationRequest({
      interaction_cid: cid,
      oidc_client_id: oidc_client.id,
      organization_id: null,
      outcome: null,
      sp_name: params.sp_name ?? null,
      user_id,
      user_ip_address: req.headers["x-forwarded-for"]?.toString() || null,
    });
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
  }
};
