//

import { isEmpty, isString } from "lodash-es";

//

export function getTrustedReferrerPath(
  referrer: string | undefined,
  base: string,
) {
  if (!isString(referrer) || isEmpty(referrer)) {
    return null;
  }

  const isValidURL = URL.canParse(referrer);
  const isValidRelativeURL = URL.canParse(referrer, base);
  let parsedURL: URL;
  if (isValidURL) {
    parsedURL = new URL(referrer);
  } else if (isValidRelativeURL) {
    // referrer may be relative
    parsedURL = new URL(referrer, base);
  } else {
    return null;
  }

  const baseURL = new URL(base);

  if (baseURL.origin !== parsedURL.origin) {
    return null;
  }

  return `${parsedURL.pathname}${parsedURL.search}`;
}
