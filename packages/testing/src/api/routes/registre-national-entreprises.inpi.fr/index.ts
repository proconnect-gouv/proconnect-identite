//

import { Hono } from "hono";
import companiesRouter from "./companies/index.js";

//

export const TestingRegistreNationalEntreprisesOpenApiRouter = new Hono()
  .get("/healthz", ({ text }) => text("ok"))
  .route("/", companiesRouter);
