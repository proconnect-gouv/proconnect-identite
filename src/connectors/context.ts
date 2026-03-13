//

import { createContext } from "@proconnect-gouv/proconnect.identite/connectors";
import { getDatabaseConnection } from "./postgres";
//

export const context = createContext(getDatabaseConnection());
