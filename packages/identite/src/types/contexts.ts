//

import type Pg from "pg";

//

export type Queryable = Pick<Pg.Pool | Pg.PoolClient, "query">;

export type DatabaseContext = {
  pg: Queryable;
};
