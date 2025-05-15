import { Router, urlencoded } from "express";
import nocache from "nocache";
import Provider from "oidc-provider";
import {
  interactionEndControllerFactory,
  interactionErrorControllerFactory,
  interactionStartControllerFactory,
} from "../controllers/interaction";
import { rateLimiterMiddleware } from "../middlewares/rate-limiter";
import { checkUserSignInRequirementsMiddleware } from "../middlewares/user";

export const interactionRouter = (oidcProvider: Provider) => {
  const interactionRouter = Router();

  interactionRouter.use(nocache());

  interactionRouter.use(urlencoded({ extended: false }));

  interactionRouter.use(rateLimiterMiddleware);

  interactionRouter.get(
    "/:grant",
    interactionStartControllerFactory(oidcProvider),
  );
  interactionRouter.get(
    "/:grant/login",
    checkUserSignInRequirementsMiddleware,
    interactionEndControllerFactory(oidcProvider),
  );
  interactionRouter.get(
    "/:grant/error",
    interactionErrorControllerFactory(oidcProvider),
  );

  return interactionRouter;
};

export default interactionRouter;
