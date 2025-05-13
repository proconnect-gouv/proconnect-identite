//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import DeleteAccessKey, { type Props } from "./DeleteAccessKey";

//

export default {
  title: "Delete Access Key",
  render: DeleteAccessKey,
  args: {
    baseurl: "http://localhost:3000",
    family_name: "Dupont",
    given_name: "Marie",
    support_email: "support+identite@proconnect.gouv.fr",
  },
} as ComponentAnnotations<Renderer, Props>;
