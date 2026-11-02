//

import { oidc_clients } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { OidcClient } from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findByClientIdFactory({ db }: DatabaseContext) {
  return async function findByClientId(
    client_id: string,
  ): Promise<OidcClient | undefined> {
    const [row] = await db
      .select()
      .from(oidc_clients)
      .where(eq(oidc_clients.client_id, client_id));

    if (!row) {
      return undefined;
    }

    return with_dates(row);
  };
}
