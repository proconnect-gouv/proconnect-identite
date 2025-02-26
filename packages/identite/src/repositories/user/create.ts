//

import { hashToPostgresParams } from "#src/services";
import type { DatabaseContext, User } from "#src/types";
import type { QueryResult } from "pg";

//

export function createUserFactory({ pg }: DatabaseContext) {
  return async function createUser({
    email,
    encrypted_password = null,
  }: {
    email: string;
    encrypted_password?: string | null;
  }) {
    const userWithTimestamps = {
      email,
      email_verified: false,
      verify_email_token: null,
      verify_email_sent_at: null,
      encrypted_password,
      magic_link_token: null,
      magic_link_sent_at: null,
      reset_password_token: null,
      reset_password_sent_at: null,
      sign_in_count: 0,
      last_sign_in_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { paramsString, valuesString, values } =
      hashToPostgresParams<User>(userWithTimestamps);

    const { rows }: QueryResult<User> = await pg.query(
      `INSERT INTO users ${paramsString} VALUES ${valuesString} RETURNING *;`,
      values,
    );
    return rows.shift()!;
  };
}

export type CreateUserHandler = ReturnType<typeof createUserFactory>;
