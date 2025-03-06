//

import {
  getFranceConnectConfigurationFactory,
  getFranceConnectRedirectUrlFactory,
  getFranceConnectUserFactory,
} from "@gouvfr-lasuite/proconnect.identite/managers/franceconnect";
import {
  FRANCECONNECT_CALLBACK_URL,
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
    callbackUrl: `${HOST}${FRANCECONNECT_CALLBACK_URL}`,
    scope: FRANCECONNECT_SCOPES.join(" "),
  },
);

export const getFranceConnectUser = getFranceConnectUserFactory(
  getFranceConnectConfiguration,
);
