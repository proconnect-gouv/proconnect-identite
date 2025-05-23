export * from "./add-domain.js";
export * from "./find-email-domains-by-organization-id.js";
export * from "./update-domain-verification-type.js";

import type { AddDomainHandler } from "./add-domain.js";
import type { FindEmailDomainsByOrganizationIdHandler } from "./find-email-domains-by-organization-id.js";
import type { UpdateDomainVerificationTypeHandler } from "./update-domain-verification-type.js";

export type EmailDomainRepository = {
  addDomain: AddDomainHandler;
  updateDomainVerificationType: UpdateDomainVerificationTypeHandler;
  findEmailDomainsByOrganizationId: FindEmailDomainsByOrganizationIdHandler;
};
