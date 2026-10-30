//

import type { IdentiteDatabase } from "#src/database";
import type * as z from "zod";

//

export type Actor =
  | { type: "app"; job: string }
  | { type: "moderator"; sub: string }
  | { type: "user"; user_id: number };

export type App = "hyyypertool" | "proconnect-identite";

export type RuntimeContext = {
  actor: Actor;
  app: App;
  db: IdentiteDatabase;
};

type ContextShape = { inputs: unknown; outcome: unknown };

export type ContextMap = Record<string, ContextShape>;

export type ContextsOf<
  Schemas extends Record<string, z.ZodType<ContextShape>>,
> = { [Action in keyof Schemas]: z.infer<Schemas[Action]> };

export type ActivityOf<Contexts extends ContextMap> = {
  [Action in keyof Contexts & string]: {
    action: Action;
    context: Contexts[Action];
  };
}[keyof Contexts & string];

export type ActivityTargets = {
  moderation_id?: number;
  organization_id?: number;
  user_id?: number;
};
