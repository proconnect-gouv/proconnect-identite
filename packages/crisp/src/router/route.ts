//

import type { ConversationRouter } from "./conversation.js";
import type { OperatorsRouter } from "./operators.js";

//

export * from "./conversation.js";
export * from "./operators.js";
export type Router = ConversationRouter | OperatorsRouter;

export type Route<
  TRequest,
  TRoute = Router,
> = TRequest extends Router["request"]
  ? TRoute extends { request: TRequest; response: infer TResponse }
    ? { request: TRequest; response: TResponse }
    : never
  : never;
