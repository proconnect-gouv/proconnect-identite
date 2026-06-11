//

import { UserNotFoundError } from "#src/errors";
import type { DatabaseContext } from "#src/types";
import { isEmpty } from "lodash-es";
import { findActiveByIdFactory } from "./find-active-by-id.js";

//

export function getActiveByIdFactory({ pg }: DatabaseContext) {
  const findActiveById = findActiveByIdFactory({ pg });
  return async function getActiveById(id: number) {
    const user = await findActiveById(id);
    if (isEmpty(user)) {
      throw new UserNotFoundError("User not found");
    }
    return user;
  };
}

export type GetActiveByIdHandler = ReturnType<typeof getActiveByIdFactory>;
