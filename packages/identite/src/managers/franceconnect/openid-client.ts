//

import {
  FranceConnectUserInfoResponseSchema,
  type FranceConnectUserInfoResponse,
} from "#src/types";
import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  ClientSecretPost,
  Configuration,
  fetchUserInfo,
  randomNonce,
  randomState,
  type ClientMetadata,
} from "openid-client";
import { z } from "zod";

//

export type FranceConnectConfigurationParams = {
  clientId: string;
  clientSecret: string;
  metadata: Partial<ClientMetadata>;
  server: URL;
};

export function getFranceConnectConfigurationFactory(
  params: FranceConnectConfigurationParams,
) {
  return function getFranceConnectConfiguration() {
    const { clientId, clientSecret, metadata, server } = params;
    const serverUri = server.toString();
    return new Configuration(
      {
        authorization_endpoint: `${serverUri}/authorize`,
        issuer: server.origin,
        jwks_uri: `${serverUri}/jwks`,
        token_endpoint: `${serverUri}/token`,
        userinfo_endpoint: `${serverUri}/userinfo`,
        token_endpoint_auth_method: "client_secret_basic",
      },
      clientId,
      metadata,
      ClientSecretPost(clientSecret),
    );
  };
}
export type GetFranceConnectConfigurationHandler = ReturnType<
  typeof getFranceConnectConfigurationFactory
>;

export function createOidcChecks() {
  return {
    state: randomState(),
    nonce: randomNonce(),
  };
}

export function getFranceConnectRedirectUrlFactory(
  getConfiguration: GetFranceConnectConfigurationHandler,
  parameters: {
    callbackUrl: string;
    scope: string;
  },
) {
  const { callbackUrl, scope } = parameters;
  return async function getFranceConnectUser(nonce: string, state: string) {
    const config = getConfiguration();
    return buildAuthorizationUrl(
      config,
      new URLSearchParams({
        nonce,
        redirect_uri: callbackUrl,
        scope,
        state,
      }),
    );
  };
}

export function getFranceConnectUserFactory(
  getConfiguration: GetFranceConnectConfigurationHandler,
) {
  return async function getFranceConnectUser(parameters: {
    code: string;
    currentUrl: string;
    expectedNonce: string;
    expectedState: string;
  }) {
    const { code, currentUrl, expectedNonce, expectedState } = parameters;
    const config = getConfiguration();
    const tokens = await authorizationCodeGrant(
      config,
      new URL(currentUrl),
      {
        expectedNonce,
        expectedState,
      },
      { code },
    );
    const claims = tokens.claims();

    const { sub } = await z
      .object({
        sub: z.string(),
      })
      .parseAsync(claims);
    const userInfo = await fetchUserInfo(config, tokens.access_token, sub);
    return FranceConnectUserInfoResponseSchema.passthrough().parseAsync(
      userInfo,
    ) as Promise<FranceConnectUserInfoResponse>;
  };
}
