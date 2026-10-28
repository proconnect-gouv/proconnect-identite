import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { AuthorizationRequest } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty, isString } from "lodash-es";
import type { IncomingHttpHeaders } from "node:http";
import type { KoaContextWithOIDC } from "oidc-provider";
import { context } from "../connectors/context";

const { oidc_clients } = context.repository;

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
