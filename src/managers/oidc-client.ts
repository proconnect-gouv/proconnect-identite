import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import {
  AuthorizationRequestOutcomeEnum,
  type AuthorizationRequest,
  type BaseAuthorizationRequest,
} from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import { sql } from "drizzle-orm";
import type { Request } from "express";
import { isEmpty, isString } from "lodash-es";
import type { IncomingHttpHeaders } from "node:http";
import type { KoaContextWithOIDC } from "oidc-provider";
import { z } from "zod";
import { context, db } from "../connectors/context";
import { logger } from "../services/log";
import { oidcProviderAdapterFactory } from "../services/oidc-provider-adapter";

const { oidc_clients } = context.repository;

const upsertAuthorizationRequest = (
  authorizationRequest: BaseAuthorizationRequest,
) =>
  db
    .insert(schema.users_oidc_clients)
    .values({
      ...authorizationRequest,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .onConflictDoUpdate({
      target: schema.users_oidc_clients.interaction_cid,
      targetWhere: sql`interaction_cid IS NOT NULL`,
      set: {
        organization_id: sql`excluded.organization_id`,
        outcome: sql`excluded.outcome`,
        sid: sql`COALESCE(excluded.sid, ${schema.users_oidc_clients.sid})`,
        updated_at: sql`excluded.updated_at`,
        user_id: sql`excluded.user_id`,
      },
    });

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
  sid,
}: {
  accountId: string;
  // workaround to extract the unexported Client type
  client: NonNullable<KoaContextWithOIDC["oidc"]["client"]>;
  interactionCid: string | null;
  organizationId: number | null;
  outcome: AuthorizationRequest["outcome"];
  params: OIDCContextParams;
  requestHeaders: IncomingHttpHeaders;
  sid: string | null;
}): Promise<void> => {
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

  await upsertAuthorizationRequest({
    user_id,
    oidc_client_id,
    organization_id: organizationId,
    sp_name,
    user_ip_address,
    interaction_cid: interactionCid,
    outcome,
    sid,
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
      logger.info("interaction.stored.not_found", {
        interaction_id: interactionId,
      });
      return;
    }

    const { cid, params } = interaction.data;
    const oidc_client = await oidc_clients.findByClientId(params.client_id);
    if (isEmpty(oidc_client)) {
      throw new NotFoundError();
    }

    await upsertAuthorizationRequest({
      interaction_cid: cid,
      oidc_client_id: oidc_client.id,
      organization_id: null,
      outcome: null,
      sid: null,
      sp_name: params.sp_name ?? null,
      user_id,
      user_ip_address: req.headers["x-forwarded-for"]?.toString() || null,
    });
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
  }
};

export const recordSignOut = async ({
  accountId,
  client,
  requestHeaders,
  sid,
}: {
  accountId: string;
  client: NonNullable<KoaContextWithOIDC["oidc"]["client"]>;
  requestHeaders: IncomingHttpHeaders;
  sid: string | null;
}) => {
  try {
    const user_id = parseInt(accountId, 10);
    const oidc_client = await oidc_clients.findByClientId(client.clientId);
    if (isEmpty(oidc_client)) {
      throw new NotFoundError();
    }

    const last_request = await db.query.users_oidc_clients.findFirst({
      columns: { sp_name: true },
      orderBy: (table, { desc }) => desc(table.created_at),
      where: (table, { and, eq }) =>
        and(
          eq(table.user_id, user_id),
          eq(table.oidc_client_id, oidc_client.id),
        ),
    });

    await upsertAuthorizationRequest({
      interaction_cid: null,
      oidc_client_id: oidc_client.id,
      organization_id: null,
      outcome: AuthorizationRequestOutcomeEnum.enum.signed_out,
      sid,
      sp_name: last_request?.sp_name ?? null,
      user_id,
      user_ip_address: requestHeaders["x-forwarded-for"]?.toString() || null,
    });
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
  }
};
