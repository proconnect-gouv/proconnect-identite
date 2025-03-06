//

import type { PromptDetail } from "oidc-provider";

//

export interface EssentialAcrPromptDetail extends PromptDetail {
  details: {
    acr: { essential: boolean; value?: string; values?: string[] };
  };
}
