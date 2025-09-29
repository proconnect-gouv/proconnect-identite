import {
  addDomainFactory,
  deleteEmailDomainsByVerificationTypesFactory,
  findEmailDomainsByOrganizationIdFactory,
} from "@gouvfr-lasuite/proconnect.identite/repositories/email-domain";
import { getDatabaseConnection } from "../connectors/postgres";

export const findEmailDomainsByOrganizationId =
  findEmailDomainsByOrganizationIdFactory({
    pg: getDatabaseConnection(),
  });

export const addDomain = addDomainFactory({
  pg: getDatabaseConnection(),
});

export const deleteEmailDomainsByVerificationTypes =
  deleteEmailDomainsByVerificationTypesFactory({
    pg: getDatabaseConnection(),
  });
