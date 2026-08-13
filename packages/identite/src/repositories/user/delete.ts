//

import type { DatabaseContext } from "#src/types";

//

export function deleteUserFactory({ pg }: DatabaseContext) {
  return async function deleteUser(id: number) {
    const { rowCount } = await pg.query(
      `
      DELETE FROM users
      WHERE id = $1
      `,
      [id],
    );

    return (rowCount ?? 0) > 0;
  };
}

export type DeleteUserHandler = ReturnType<typeof deleteUserFactory>;
