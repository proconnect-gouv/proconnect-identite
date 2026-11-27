import type { KoaContextWithOIDC } from "oidc-provider";
import { getGrantOrganization } from "../repositories/redis/grant-organization";

//

export const getAuthorizedOrganizationFromLoadedGrant = async (
  ctx: KoaContextWithOIDC,
) => {
  // ctx.oidc.grant is untyped; this may be an unsaved grant, without jti
  const grantId = ctx.oidc.entities.Grant?.jti;
  return grantId ? getGrantOrganization(grantId) : undefined;
};

export const getAuthorizedOrganizationFromToken = async (
  token: { grantId?: string } | undefined,
) => (token?.grantId ? getGrantOrganization(token.grantId) : undefined);
