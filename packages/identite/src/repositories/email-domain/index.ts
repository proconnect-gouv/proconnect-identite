export * from "./add-domain.js";
export * from "./delete-email-domains-by-verification-types.js";
export * from "./find-email-domains-by-organization-id.js";

import type { AddDomainHandler } from "./add-domain.js";
import type { DeleteEmailDomainsByVerificationTypesHandler } from "./delete-email-domains-by-verification-types.js";
import type { FindEmailDomainsByOrganizationIdHandler } from "./find-email-domains-by-organization-id.js";

export type EmailDomainRepository = {
  addDomain: AddDomainHandler;
  deleteEmailDomainsByVerificationTypes: DeleteEmailDomainsByVerificationTypesHandler;
  findEmailDomainsByOrganizationId: FindEmailDomainsByOrganizationIdHandler;
};
