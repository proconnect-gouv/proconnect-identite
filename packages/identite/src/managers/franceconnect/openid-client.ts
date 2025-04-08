//

import {
  FranceConnectUserInfoResponseSchema,
  type FranceConnectUserInfoResponse,
} from "#src/types";
import {
  allowInsecureRequests,
  authorizationCodeGrant,
  buildAuthorizationUrl,
  buildEndSessionUrl,
  ClientSecretBasic,
  discovery,
  fetchUserInfo,
  randomNonce,
  randomState,
  type ClientMetadata,
} from "openid-client";
import { z } from "zod";

//

export type FranceConnectConfigurationParams = {
  allowLocalhost?: boolean;
  clientId: string;
  clientSecret: string;
  metadata: Partial<ClientMetadata>;
  server: URL;
};

export function getFranceConnectConfigurationFactory(
  params: FranceConnectConfigurationParams,
) {
  const { allowLocalhost, clientId, clientSecret, metadata, server } = params;
  return function getFranceConnectConfiguration() {
    return discovery(
      server,
      clientId,
      metadata,
      ClientSecretBasic(clientSecret),
      allowLocalhost ? { execute: [allowInsecureRequests] } : undefined,
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
    const config = await getConfiguration();
    return buildAuthorizationUrl(
      config,
      new URLSearchParams({
        acr_values: "eidas1",
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
    const config = await getConfiguration();
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

    const { sub } = await z.object({ sub: z.string() }).parseAsync(claims);
    const user_info_response = await fetchUserInfo(
      config,
      tokens.access_token,
      sub,
    );

    const user_info: FranceConnectUserInfoResponse =
      await FranceConnectUserInfoResponseSchema.parseAsync(user_info_response);
    return { user_info, id_token: tokens.id_token };
  };
}

export function getFranceConnectLogoutRedirectUrlFactory(
  getConfiguration: GetFranceConnectConfigurationHandler,
) {
  return async function getFranceConnectLogoutRedirectUrl(
    id_token_hint: string,
    post_logout_redirect_uri: string,
    state: string,
  ) {
    const config = await getConfiguration();
    return buildEndSessionUrl(config, {
      id_token_hint,
      post_logout_redirect_uri,
      state,
    });
  };
}
