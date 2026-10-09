//

import { getTrustedReferrerPath } from "./get-trusted-referrer-path.js";

//

export type RequestLike = {
  method: string;
  originalUrl: string;
  get(name: string): string | undefined;
};

export function getTrustedReferrerPathFromRequest(
  req: RequestLike,
  base: string,
) {
  // If the method is not GET (ex: POST), then the referrer must be taken from
  // the referrer header. This ensures the referrerPath can be redirected to.
  const originPath =
    req.method === "GET" ? getTrustedReferrerPath(req.originalUrl, base) : null;
  const referrerPath = getTrustedReferrerPath(req.get("Referrer"), base);

  return originPath || referrerPath || undefined;
}
