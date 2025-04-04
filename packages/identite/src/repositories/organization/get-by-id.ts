//

import { OrganizationNotFoundError } from "#src/errors";
import type { DatabaseContext } from "#src/types";
import { isEmpty } from "lodash-es";
import { findByIdFactory } from "./find-by-id.js";

//

export function getByIdFactory({ pg }: DatabaseContext) {
  const findById = findByIdFactory({ pg });
  return async function getById(id: number) {
    const organization = await findById(id);
    if (isEmpty(organization)) {
      throw new OrganizationNotFoundError("Organization not found");
    }
    return organization;
  };
}

export type GetByIdHandler = ReturnType<typeof getByIdFactory>;
