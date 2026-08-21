//

import { type DatabaseContext, type Moderation } from "#src/types";
import { ModerationNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { findModerationByIdFactory } from "./find-moderation-by-id.js";

//

export function getModerationByIdFactory({ pg }: DatabaseContext) {
  const findModerationById = findModerationByIdFactory({ pg });

  return async function getModerationById(id: number): Promise<Moderation> {
    const moderation = await findModerationById(id);
    if (!moderation) {
      throw new ModerationNotFoundError(`Moderation ${id} not found`);
    }
    return moderation;
  };
}
