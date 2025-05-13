//

import type { FindBySirenHandler, FindBySiretHandler } from "./insee/index.js";

export interface ApiInseeRepository {
  findBySiren: FindBySirenHandler;
  findBySiret: FindBySiretHandler;
}
