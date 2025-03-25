//

import { Hono } from "hono";
import etablissementsRouter from "./etablissements/index.js";
import mandatairesRouter from "./mandataires_sociaux/index.js";

//

export const TestingEntrepriseApiRouter = new Hono()
  .route("/", etablissementsRouter)
  .route("/", mandatairesRouter);
