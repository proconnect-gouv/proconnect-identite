//

import type { Request } from "express";

//

export function clearInteractionSession(req: Request) {
  req.session.authForProconnectFederation = undefined;
  req.session.certificationDirigeantRequested = undefined;
  req.session.interactionId = undefined;
  req.session.mustReturnOneOrganizationInPayload = undefined;
  req.session.twoFactorsAuthRequested = undefined;
}
