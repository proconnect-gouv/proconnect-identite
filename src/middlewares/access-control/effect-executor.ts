import type {
  Effect,
  EffectExecutor,
} from "@proconnect-gouv/proconnect.identite/managers/access-control";
import { selectOrganization } from "../../managers/organization/main.js";

/**
 * Executes side effects declared by access control checks.
 *
 * This is the impure boundary where declared effects become real I/O operations.
 * Each effect type maps to a specific side-effectful operation.
 */
export const executeEffect: EffectExecutor = async (effect: Effect) => {
  switch (effect.type) {
    case "select_organization":
      await selectOrganization({
        organization_id: effect.organization_id,
        user_id: effect.user_id,
      });
      break;

    default:
      effect.type satisfies never;
  }
};
