//

import { Hono } from "hono";
import etablissementsRouter from "./etablissements/index.js";
import mandatairesRouter from "./mandataires_sociaux/index.js";

//

export const TestingApiEntrepriseRouter = new Hono()
  .get("/healthz", ({ text }) => text("ok"))
  .route("/", etablissementsRouter)
  .route("/", mandatairesRouter);
