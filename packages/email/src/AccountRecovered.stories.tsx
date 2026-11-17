//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import AccountRecovered, { type Props } from "./AccountRecovered.js";

//

export default {
  title: "Account Recovered",
  render: AccountRecovered,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    support_email: "support+identite@proconnect.gouv.fr",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
