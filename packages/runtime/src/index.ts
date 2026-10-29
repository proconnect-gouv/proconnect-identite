//

import type { IdentiteDatabase } from "./database.js";
import { markDomainAsVerifiedFactory } from "./mark-domain-as-verified.js";

//

export type { IdentiteDatabase } from "./database.js";

export function createIdentiteRuntime({ db }: { db: IdentiteDatabase }) {
  return {
    markDomainAsVerified: markDomainAsVerifiedFactory({ db }),
  };
}
