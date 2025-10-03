//

import Pg from "pg";

//

export type DatabaseContext = {
  pg: Pg.Pool;
};
