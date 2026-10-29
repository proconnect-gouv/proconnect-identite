//

import type * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

//

export type IdentiteDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

export type IdentiteTransaction = Parameters<
  Parameters<IdentiteDatabase["transaction"]>[0]
>[0];
