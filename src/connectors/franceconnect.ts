//

import {
  getFranceConnectConfigurationFactory,
  getFranceConnectLogoutRedirectUrlFactory,
  getFranceConnectRedirectUrlFactory,
  getFranceConnectUserFactory,
} from "@gouvfr-lasuite/proconnect.identite/managers/franceconnect";
import {
  DEPLOY_ENV,
  FRANCECONNECT_CLIENT_ID,
  FRANCECONNECT_CLIENT_SECRET,
  FRANCECONNECT_ID_TOKEN_SIGNED_RESPONSE_ALG,
  FRANCECONNECT_ISSUER,
  FRANCECONNECT_SCOPES,
  HOST,
} from "../config/env";

//

export const getFranceConnectConfiguration =
  getFranceConnectConfigurationFactory({
    allowLocalhost: DEPLOY_ENV === "localhost",
    clientId: FRANCECONNECT_CLIENT_ID,
    clientSecret: FRANCECONNECT_CLIENT_SECRET,
    metadata: {
      id_token_signed_response_alg: FRANCECONNECT_ID_TOKEN_SIGNED_RESPONSE_ALG,
    },
    server: new URL(FRANCECONNECT_ISSUER),
  });

export const getFranceConnectRedirectUrl = getFranceConnectRedirectUrlFactory(
  getFranceConnectConfiguration,
  {
    callbackUrl: `${HOST}/users/franceconnect/callback`,
    scope: FRANCECONNECT_SCOPES.join(" "),
  },
);

export const getFranceConnectUser = getFranceConnectUserFactory(
  getFranceConnectConfiguration,
);

export const getFranceConnectLogoutRedirectUrl =
  getFranceConnectLogoutRedirectUrlFactory(getFranceConnectConfiguration);
