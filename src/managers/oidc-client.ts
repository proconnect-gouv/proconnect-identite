import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type {
  BaseConnection,
  Connection,
} from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import { isEmpty, isString } from "lodash-es";
import type { IncomingHttpHeaders } from "node:http";
import type { KoaContextWithOIDC } from "oidc-provider";
import { context } from "../connectors/context";
import { getSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { logger } from "../services/log";

const { addConnection, findByClientId } = context.repository.oidc_clients;

export const recordNewConnection = async ({
  accountId,
  client,
  params,
  requestHeaders,
}: {
  accountId: string;
  // workaround to extract the unexported Client type
  client: NonNullable<KoaContextWithOIDC["oidc"]["client"]>;
  params: OIDCContextParams;
  requestHeaders: IncomingHttpHeaders;
}): Promise<Connection> => {
  const user_id = parseInt(accountId, 10);

  const client_id = client.clientId;
  const oidc_client = await findByClientId(client_id);
  if (isEmpty(oidc_client)) {
    throw new NotFoundError();
  }
  const oidc_client_id = oidc_client.id;

  let organization_id: BaseConnection["organization_id"] = null;
  try {
    organization_id = await getSelectedOrganizationId(user_id);
  } catch (err) {
    // This is unexpected, we silently fail and log it in sentry
    logger.error(err);
    Sentry.captureException(err);
  }

  let sp_name: string | null = null;
  if (isString(params?.sp_name)) {
    sp_name = params.sp_name;
  }

  const user_ip_address = requestHeaders["x-forwarded-for"]?.toString() || null;

  return await addConnection({
    user_id,
    oidc_client_id,
    organization_id,
    sp_name,
    user_ip_address,
  });
};
