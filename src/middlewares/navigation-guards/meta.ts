import { match, P } from "ts-pattern";
import {
  browserIsTrustedGuard,
  isUserGuard,
  userBelongsToHintedOrganizationGuard,
  userHasAtLeastOneOrganizationGuard,
  userHasPersonalInformationsGuard,
  userHasSeenInclusionconnectOnboardingHelpGuard,
  userHasSelectedAnOrganizationGuard,
  userHasValidFranceConnectIdentityGuard,
  userIsAuthenticatedGuard,
  userIsCertifiedAsDirigeantGuard,
  userIsMfaAuthenticatedIfOrganizationRequiresIt,
  userIsMfaAuthenticatedIfRequiredGuard,
  userIsVerifiedGuard,
} from "./guards";
import { type GuardResult, Pass, type RequestContext } from "./internals";
import {
  process,
  processGreetingsForSelectedOrganizationGuard,
  processOfficialContactEmailVerificationGuard,
  processPendingModerationGuard,
} from "./process";

export const userCanAccessAppGuard = async (prev: Pass<RequestContext>) => {
  let context;

  context = isUserGuard(prev);
  if (!Pass.is_passing(context)) return context;

  context = userIsAuthenticatedGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userIsVerifiedGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userIsMfaAuthenticatedIfRequiredGuard(prev);
  if (!Pass.is_passing(context)) return context;

  context = await browserIsTrustedGuard(context);
  if (!Pass.is_passing(context)) return context;

  return userHasSeenInclusionconnectOnboardingHelpGuard(context);
};
export const userCanConnectToSpGuard = async (
  prev: Pass<RequestContext>,
): Promise<GuardResult<string, RequestContext>> => {
  let context;

  context = await userHasAtLeastOneOrganizationGuard(prev);
  if (!Pass.is_passing(context)) return context;

  context = await userBelongsToHintedOrganizationGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userHasSelectedAnOrganizationGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userIsMfaAuthenticatedIfOrganizationRequiresIt(context);
  if (!Pass.is_passing(context)) return context;

  context = await userHasValidFranceConnectIdentityGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userIsCertifiedAsDirigeantGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userHasPersonalInformationsGuard(context);
  if (!Pass.is_passing(context)) return context;

  return context.pass("user_can_connect_to_sp");
};

export async function userComplyWithAllRequirementsGuard(
  prev: Pass<RequestContext>,
): Promise<GuardResult<string, RequestContext>> {
  let context;

  context = await userCanAccessAppGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const {
    pendingModerationOrganizationId,
    interactionId,
    pendingCertificationDirigeantOrganizationId,
    pendingOfficialContactEmailVerificationOrganizationId,
    pendingGreetingsForSelectedOrganization,
  } = context.data.req.session;

  return match({
    pendingModerationOrganizationId,
    interactionId,
    pendingCertificationDirigeantOrganizationId,
    pendingOfficialContactEmailVerificationOrganizationId,
    pendingGreetingsForSelectedOrganization,
  })
    .with({ pendingModerationOrganizationId: P.number }, () =>
      processPendingModerationGuard(context),
    )
    .with({ pendingCertificationDirigeantOrganizationId: P.number }, () =>
      process(context),
    )
    .with(
      { pendingOfficialContactEmailVerificationOrganizationId: P.number },
      () => processOfficialContactEmailVerificationGuard(context),
    )
    .with({ pendingGreetingsForSelectedOrganization: true }, () =>
      processGreetingsForSelectedOrganizationGuard(context),
    )
    .with({ interactionId: P.string }, () => userCanConnectToSpGuard(context))
    .otherwise(() => context.pass("user_comply_with_all_requirements"));
}
