import type { KoaContextWithOIDC, Session } from "oidc-provider";
import {
  getGrantOrganization,
  type GrantOrganization,
} from "../repositories/redis/grant-organization";

//

type AuthorizationsHolder = Pick<Session, "authorizations">;

type GetGrantOrganization = (
  grantId: string,
) => Promise<GrantOrganization | undefined>;

// TODO(PR 2): remove the session.authorizations fallback once sessions created
// before the grant-per-interaction deploy have expired (SESSION_MAX_AGE_IN_SECONDS).
const getLegacyAuthorizedOrganization = (
  session: AuthorizationsHolder | undefined,
  clientId: string | undefined,
) => {
  if (!session || !clientId) return undefined;
  const authorization = session.authorizations?.[clientId];
  if (authorization?.organizationId === undefined) return undefined;
  return {
    organizationId: authorization.organizationId,
    acr: authorization.acr,
  };
};

// /authorize and resume: the grant is ctx.oidc.entities.Grant (ctx.oidc.grant, which
// is untyped), loaded by oidc-provider's default loadExistingGrant.
export const getAuthorizedOrganizationFactory =
  ({ getGrantOrganization }: { getGrantOrganization: GetGrantOrganization }) =>
  async (ctx: KoaContextWithOIDC) => {
    // it may be an unsaved grant built by oidc-provider, without jti
    const grantId = ctx.oidc.entities.Grant?.jti;
    const grantOrganization = grantId
      ? await getGrantOrganization(grantId)
      : undefined;
    return (
      grantOrganization ??
      getLegacyAuthorizedOrganization(
        ctx.oidc.session,
        ctx.oidc.client?.clientId,
      )
    );
  };

export const getAuthorizedOrganization = getAuthorizedOrganizationFactory({
  getGrantOrganization,
});

// /token and /userinfo are called by the SP: there is no browser session, go through the token.
export const findAuthorizedOrganizationFactory =
  ({ getGrantOrganization }: { getGrantOrganization: GetGrantOrganization }) =>
  async (
    ctx: KoaContextWithOIDC,
    token:
      | { grantId?: string; sessionUid?: string; clientId?: string }
      | undefined,
  ) => {
    if (!token?.grantId) return undefined;
    const grantOrganization = await getGrantOrganization(token.grantId);
    if (grantOrganization) return grantOrganization;
    if (!token.sessionUid) return undefined;
    const session = await ctx.oidc.provider.Session.findByUid(token.sessionUid);
    return getLegacyAuthorizedOrganization(session, token.clientId);
  };

export const findAuthorizedOrganization = findAuthorizedOrganizationFactory({
  getGrantOrganization,
});
