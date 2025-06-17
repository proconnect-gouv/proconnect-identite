//

import { Hono } from "hono";
import etablissementsRouter from "./etablissements/index.js";

//

export const TestingInseeApiRouter = new Hono()
  .get("/healthz", ({ text }) => text("ok"))
  .route("/", etablissementsRouter);
