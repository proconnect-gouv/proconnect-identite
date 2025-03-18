export * from "./add-domain.js";
export * from "./find-email-domains-by-organization-id.js";

import type { AddDomainHandler } from "./add-domain.js";
import type { FindEmailDomainsByOrganizationIdHandler } from "./find-email-domains-by-organization-id.js";

export type EmailDomainRepository = {
  addDomain: AddDomainHandler;
  findEmailDomainsByOrganizationId: FindEmailDomainsByOrganizationIdHandler;
};
