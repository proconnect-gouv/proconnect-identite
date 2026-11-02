//

import { ModerationNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { type Moderation } from "@proconnect-gouv/proconnect.identite/types";
import type { DatabaseContext } from "../context";
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
