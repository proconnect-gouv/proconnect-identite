//

import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { router, type TestingBindings } from "./routes/index.js";

//

export function createTestingHandler(
  basePath: string,
  context: TestingBindings,
) {
  const app = new Hono()
    .basePath(basePath)
    .use(
      logger((message: string, ...rest: string[]) => {
        console.log("[🎭]", message, ...rest);
      }),
    )
    .route("/", router)
    .notFound(function notFound() {
      return new Response("404 Not Found", { status: 404 });
    })
    .onError(function errorHandler(error, { json }) {
      return json(error);
    });
  return getRequestListener(function fetchCallback(request, env) {
    return app.request(request, {}, { ...env, ...context });
  });
}
