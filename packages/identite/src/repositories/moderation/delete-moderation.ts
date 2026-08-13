//

import type { DatabaseContext } from "#src/types";

//

export function deleteModerationFactory({ pg }: DatabaseContext) {
  return async function deleteModeration(id: number) {
    const { rowCount } = await pg.query(
      `
      DELETE FROM moderations
      WHERE id = $1
      `,
      [id],
    );

    return (rowCount ?? 0) > 0;
  };
}

export type DeleteModerationHandler = ReturnType<
  typeof deleteModerationFactory
>;
