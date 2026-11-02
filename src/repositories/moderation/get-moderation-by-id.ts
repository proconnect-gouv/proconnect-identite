//

import { ModerationNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { DatabaseContext } from "../database";
import { findModerationByIdFactory } from "./find-moderation-by-id";

//

export function getModerationByIdFactory({ db }: DatabaseContext) {
  const findModerationById = findModerationByIdFactory({ db });

  return async function getModerationById(id: number) {
    const moderation = await findModerationById(id);

    if (!moderation) {
      throw new ModerationNotFoundError(`Moderation ${id} not found`);
    }

    return moderation;
  };
}
