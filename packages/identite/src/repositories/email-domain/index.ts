export * from "./find-email-domains-by-organization-id.js";

import type { FindEmailDomainsByOrganizationIdHandler } from "./find-email-domains-by-organization-id.js";

export type EmailDomainRepository = {
  findEmailDomainsByOrganizationId: FindEmailDomainsByOrganizationIdHandler;
};
