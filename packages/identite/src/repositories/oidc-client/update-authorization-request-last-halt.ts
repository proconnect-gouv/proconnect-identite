//

import type { AuthorizationRequestLastHalt, DatabaseContext } from "#src/types";

//

export function updateAuthorizationRequestLastHaltFactory({
  pg,
}: DatabaseContext) {
  return async function updateAuthorizationRequestLastHalt({
    interaction_cid,
    last_halt,
  }: {
    interaction_cid: string;
    last_halt: AuthorizationRequestLastHalt;
  }) {
    await pg.query(
      `
UPDATE users_oidc_clients
SET last_halt = $1, updated_at = $2
WHERE interaction_cid = $3;
`,
      [last_halt, new Date(), interaction_cid],
    );
  };
}
