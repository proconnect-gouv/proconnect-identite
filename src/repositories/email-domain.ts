import { context } from "../connectors/context";

export const {
  addDomain,
  deleteEmailDomainsByVerificationTypes,
  findEmailDomainsByOrganizationId,
} = context.repo.email_domains;
