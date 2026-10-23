import type { KoaContextWithOIDC, Session } from "oidc-provider";

//

type AuthorizationsHolder = Pick<Session, "authorizations">;

export const getAuthorizedOrganization = (
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

// Reassign the top-level property: the oidc-provider session Proxy
// (lib/shared/session.js) only marks the session as modified on top-level writes.
export const setAuthorizedOrganization = (
  session: AuthorizationsHolder,
  clientId: string,
  { organizationId, acr }: { organizationId: number; acr?: string },
) => {
  session.authorizations = {
    ...session.authorizations,
    [clientId]: { ...session.authorizations?.[clientId], organizationId, acr },
  };
};

// /token and /userinfo are called by the SP: there is no browser cookie, so
// ctx.oidc.session is not the user's session. Load it through the token instead.
export const findAuthorizedOrganization = async (
  ctx: KoaContextWithOIDC,
  token: { sessionUid?: string; clientId?: string } | undefined,
) => {
  if (!token?.sessionUid) return undefined;
  const session = await ctx.oidc.provider.Session.findByUid(token.sessionUid);
  return getAuthorizedOrganization(session, token.clientId);
};
