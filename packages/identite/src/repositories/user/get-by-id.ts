//

import { UserNotFoundError } from "#src/errors";
import type { DatabaseContext } from "#src/types";
import { isEmpty } from "lodash-es";
import { findByIdFactory } from "./find-by-id.js";

//

export function getByIdFactory({ pg }: DatabaseContext) {
  const findById = findByIdFactory({ pg });
  return async function getById(id: number) {
    const user = await findById(id);
    if (isEmpty(user)) {
      throw new UserNotFoundError("User not found");
    }
    return user;
  };
}

export type GetByIdHandler = ReturnType<typeof getByIdFactory>;
