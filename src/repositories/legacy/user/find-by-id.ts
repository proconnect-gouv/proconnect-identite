//

import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { type QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function findByIdFactory({ pg }: DatabaseContext) {
  return async function findById(id: number) {
    const { rows }: QueryResult<User> = await pg.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      `,
      [id],
    );

    return rows.shift();
  };
}

export type FindByIdHandler = ReturnType<typeof findByIdFactory>;
