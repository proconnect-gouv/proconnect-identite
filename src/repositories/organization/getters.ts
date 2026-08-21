import { context } from "../../connectors/context";

export const {
  findById,
  findBySiret,
  findByUserId,
  findByVerifiedEmailDomain,
  findPendingByUserId,
  getUserOrganizationLink,
  getUsers,
} = context.repository.organizations;
