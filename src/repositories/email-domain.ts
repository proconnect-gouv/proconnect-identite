import { context } from "../connectors/context";

export const {
  addDomain,
  deleteEmailDomainsByVerificationTypes,
  findEmailDomainsByOrganizationId,
} = context.repository.email_domains;
