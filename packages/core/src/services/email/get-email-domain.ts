//

import { parse_host } from "tld-extract";

//

/**
 * Get the domain of an email address
 * @example
 * getEmailDomain("lion.eljonson@darkangels.world") // darkangels.world
 * @param email - the email address
 * @returns the domain of the email address
 */
export function getEmailDomain(email: string) {
  const parts = email.split("@");
  const host = parts[parts.length - 1];
  const { sub, domain } = parse_host(host, { allowDotlessTLD: true });

  return [sub, domain].filter(Boolean).join(".");
}
