//

import type { DatabaseContext, Organization } from "#src/types";
import { type QueryResult } from "pg";

//

export function findBySiretFactory({ pg }: DatabaseContext) {
  return async function findBySiret(siret: string) {
    const { rows }: QueryResult<Organization> = await pg.query(
      `
SELECT *
FROM organizations
WHERE siret = $1
`,
      [siret],
    );

    return rows.shift();
  };
}
