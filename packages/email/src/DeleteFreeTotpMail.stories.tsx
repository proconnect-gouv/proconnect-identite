//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import DeleteFreeTotpMail, { type Props } from "./DeleteFreeTotpMail";

//

export default {
  title: "Delete Free TOTP",
  render: DeleteFreeTotpMail,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    support_email: "support+identite@proconnect.gouv.fr",
    baseurl: "http://localhost:3000",
  },
} as ComponentAnnotations<Renderer, Props>;
