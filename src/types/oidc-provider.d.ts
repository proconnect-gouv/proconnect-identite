//
// NOTE(douglasduteil): app related oidc-provider types
// Those interfaces override the type which is incomplete in the original lib
//

import type {
  InteractionResults,
  OIDCContext,
  UnknownObject,
} from "oidc-provider";

declare global {
  /**
   * Extends the {@link OIDCContext.params} type.
   * Should be used instead of KoaContextWithOIDC["oidc"]["params"]
   */
  interface OIDCContextParams extends UnknownObject {
    client_id: string;
    login_hint: string;
    prompt: "select_organization" | "update_userinfo";
    scope: string;
    sp_name?: string;
  }

  /**
   * Extends the {@link OIDCContext.result} type.
   */
  interface OidcInteractionResults extends InteractionResults {
    select_organization?: boolean;
    update_userinfo?: boolean;
  }
}
