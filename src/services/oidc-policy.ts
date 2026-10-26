import { interactionPolicy } from "oidc-provider";
import { context } from "../connectors/context";
import { getAuthorizedOrganization } from "./oidc-authorized-organization";

const { organizations } = context.repository;

//

const { Prompt, Check, base } = interactionPolicy;

const policy = base();

policy.add(
  new Prompt(
    { name: "choose_organization", requestable: false },
    new Check(
      "organization_missing",
      "End-User must select one organization",
      async (ctx) => {
        const authorized = getAuthorizedOrganization(
          ctx.oidc.session,
          ctx.oidc.client?.clientId,
        );

        if (!authorized) {
          return Check.REQUEST_PROMPT;
        }

        // session.acr is shared by all clients: if another SP re-authenticated this
        // session for another organization, the acr no longer matches this organization.
        if (authorized.acr !== ctx.oidc.session?.acr) {
          return Check.REQUEST_PROMPT;
        }

        const { siret_hint } = ctx.oidc.params as OIDCContextParams;
        if (siret_hint) {
          const organization = await organizations.findById(
            authorized.organizationId,
          );
          if (organization?.siret !== siret_hint) {
            return Check.REQUEST_PROMPT;
          }
        }

        return Check.NO_NEED_TO_PROMPT;
      },
    ),
  ),
);

policy.add(
  new Prompt(
    { name: "select_organization", requestable: true },

    new Check(
      "organization_selection_prompt",
      "client required organization selection prompt",
      "interaction_required",
      async (ctx) => {
        const { oidc } = ctx;
        const oidcContextParams = ctx.oidc.params as OIDCContextParams;
        const oidcContextResult = oidc.result as OidcInteractionResults;
        if (
          oidcContextParams.prompt === "select_organization" &&
          !oidcContextResult?.select_organization
        ) {
          return Check.REQUEST_PROMPT;
        }

        return Check.NO_NEED_TO_PROMPT;
      },
    ),
  ),
);

policy.add(
  new Prompt(
    { name: "update_userinfo", requestable: true },

    new Check(
      "update_userinfo_prompt",
      "client required userinfo edition prompt",
      "interaction_required",
      async (ctx) => {
        const { oidc } = ctx;
        const oidcContextParams = oidc.params as OIDCContextParams;
        const oidcContextResult = oidc.result as OidcInteractionResults;
        if (
          oidcContextParams.prompt === "update_userinfo" &&
          !oidcContextResult?.update_userinfo
        ) {
          return Check.REQUEST_PROMPT;
        }

        return Check.NO_NEED_TO_PROMPT;
      },
    ),
  ),
);

export default policy;
