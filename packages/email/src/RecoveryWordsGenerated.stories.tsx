//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import RecoveryWordsGenerated, {
  type Props,
} from "./RecoveryWordsGenerated.js";

//

export default {
  title: "Recovery Words Generated",
  render: RecoveryWordsGenerated,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    support_email: "support+identite@proconnect.gouv.fr",
    regenerated: false,
  } satisfies Props,
} as ComponentAnnotations<Renderer, Props>;
