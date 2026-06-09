import type { User } from "@proconnect-gouv/proconnect.identite/types";
import type { QueryResult } from "pg";
import { context } from "../connectors/context";
import { getDatabaseConnection } from "../connectors/postgres";

//

export const {
  create,
  findByEmail,
  findActiveByEmail,
  findActiveById,
  findById,
  getById,
  getActiveById,
  getFranceConnectUserInfo,
  update,
  upsetFranceconnectUserinfo,
} = context.repository.users;

export const findByMagicLinkToken = async (magic_link_token: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT *
FROM users WHERE magic_link_token = $1 AND deleted_at IS NULL
`,
    [magic_link_token],
  );

  return rows.shift();
};

export const findActiveByResetPasswordToken = async (
  reset_password_token: string,
) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT *
FROM users WHERE reset_password_token = $1 AND deleted_at IS NULL
`,
    [reset_password_token],
  );

  return rows.shift();
};

export const softDeleteUser = async (id: number) => {
  const connection = getDatabaseConnection();

  const { rowCount } = await connection.query(
    `
        UPDATE users
        SET deleted_at = NOW()
        WHERE id = $1
        RETURNING *`,
    [id],
  );

  return (rowCount ?? 0) > 0;
};
