//

import {
  StrongLinkValues,
  SuperWeakLinkValues,
  UnverifiedLinkValues,
  WeakLinkValues,
  type LinkType,
} from "#src/types";
import { match } from "ts-pattern";
import type { AssuranceLevels } from "./acr-from-assurance-levels.js";

export const oalFromVerificationType = (verification_type: LinkType) =>
  match(verification_type)
    .returnType<AssuranceLevels["oal"]>()
    .with(...UnverifiedLinkValues, () => "declared")
    .with(...WeakLinkValues, ...SuperWeakLinkValues, () => "moderated")
    .with(...StrongLinkValues, () => "certified")
    .exhaustive();
