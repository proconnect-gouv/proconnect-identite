//

import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { DatabaseContext } from "../database";
import { findByIdFactory } from "./find-by-id.js";

//

export function getByIdFactory({ db }: DatabaseContext) {
  const findById = findByIdFactory({ db });

  return async function getById(id: number) {
    const user = await findById(id);

    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    return user;
  };
}
