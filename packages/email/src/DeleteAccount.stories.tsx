//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import DeleteAccount, { type Props } from "./DeleteAccount";

//

export default {
  title: "Delete Account",
  render: DeleteAccount,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    support_email: "support+identite@proconnect.gouv.fr",
    baseurl: "http://localhost:3000",
  },
} as ComponentAnnotations<Renderer, Props>;
