import { DOMAINS_WHITELIST } from "@proconnect-gouv/proconnect.identite/data/organization";

export function isDomainAllowedForOrganization(siret: string, domain: string) {
  const whitelist = DOMAINS_WHITELIST.get(siret);

  // Allow unknown siret to ignore whitelisting
  if (!whitelist) return true;

  return whitelist.includes(domain);
}
