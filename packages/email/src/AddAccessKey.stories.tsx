//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import AddAccessKey, { type Props } from "./AddAccessKey.js";

//

export default {
  title: "Add Access Key",
  render: AddAccessKey,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    key_name: "Chrome on Mac",
    support_email: "support+identite@proconnect.gouv.fr",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
