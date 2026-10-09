import {
  browserIsTrustedGuard,
  isUserGuard,
  userHasAtLeastOneOrganizationGuard,
  userHasAuthenticatedRecentlyGuard,
  userHasProvidedAnEmailGuard,
  userHasSeenInclusionconnectWelcomePageGuard,
  userIsAuthenticatedGuard,
  userIsMfaAuthenticatedIfCapableGuard,
  userIsVerifiedGuard,
} from "./guards";
import { createGuardMiddleware, Pass, type RequestContext } from "./internals";
import {
  userCanAccessAppGuard,
  userComplyWithAllRequirementsGuard,
} from "./meta";

export const isUserGuardMiddleware = createGuardMiddleware(isUserGuard);

export const userCanSeeInclusionConnectWelcomePageGuardMiddleware =
  createGuardMiddleware(async (prev: Pass<RequestContext>) => {
    let context;

    context = isUserGuard(prev);
    if (!Pass.is_passing(context)) return context;

    return userHasProvidedAnEmailGuard(context);
  });

export const userCanBePromptedForCredentialsGuardMiddleware =
  createGuardMiddleware(async (prev: Pass<RequestContext>) => {
    let context;

    context = isUserGuard(prev);
    if (!Pass.is_passing(context)) return context;

    context = userHasProvidedAnEmailGuard(prev);
    if (!Pass.is_passing(context)) return context;

    return userHasSeenInclusionconnectWelcomePageGuard(context);
  });

export const userIsAuthenticatedGuardMiddleware = createGuardMiddleware(
  async (prev: Pass<RequestContext>) => {
    let context;

    context = isUserGuard(prev);
    if (!Pass.is_passing(context)) return context;

    return userIsAuthenticatedGuard(context);
  },
);

export const userCanSetupMfaGuardMiddleware = createGuardMiddleware(
  async (prev: Pass<RequestContext>) => {
    let context;

    context = isUserGuard(prev);
    if (!Pass.is_passing(context)) return context;

    context = userIsAuthenticatedGuard(context);
    if (!Pass.is_passing(context)) return context;

    context = await userHasAuthenticatedRecentlyGuard(context);
    if (!Pass.is_passing(context)) return context;

    context = await userIsMfaAuthenticatedIfCapableGuard(context);
    if (!Pass.is_passing(context)) return context;

    return await browserIsTrustedGuard(context);
  },
);

export const userCanBePromptedForMfaGuardMiddleware = createGuardMiddleware(
  async (prev: Pass<RequestContext>) => {
    let context;

    context = isUserGuard(prev);
    if (!Pass.is_passing(context)) return context;

    context = userIsAuthenticatedGuard(context);
    if (!Pass.is_passing(context)) return context;

    return userIsVerifiedGuard(context);
  },
);

export const userCanAccessAppGuardMiddleware = createGuardMiddleware(
  userCanAccessAppGuard,
);

export const userCanAccessAdminGuardMiddleware = createGuardMiddleware(
  async (prev: Pass<RequestContext>) => {
    let context;

    context = await userCanAccessAppGuard(prev);
    if (!Pass.is_passing(context)) return context;

    context = await userHasAuthenticatedRecentlyGuard(context);
    if (!Pass.is_passing(context)) return context;

    return await userIsMfaAuthenticatedIfCapableGuard(context);
  },
);

export const userCanSelectAnOrganizationGuardMiddleware = createGuardMiddleware(
  async (prev) => {
    let context;

    context = await userCanAccessAppGuard(prev);
    if (!Pass.is_passing(context)) return context;

    return userHasAtLeastOneOrganizationGuard(context);
  },
);

// check that the user goes through all requirements before issuing a session
export const userComplyWithAllRequirementsGuardMiddleware =
  createGuardMiddleware(userComplyWithAllRequirementsGuard);
