import { context } from "../connectors/context";

export const {
  create,
  delete: deleteUser,
  findByEmail,
  findById,
  findByMagicLinkToken,
  findByResetPasswordToken,
  getById,
  getFranceConnectUserInfo,
  update,
  upsetFranceconnectUserinfo,
} = context.repository.users;
