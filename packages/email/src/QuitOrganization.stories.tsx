//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import QuitOrganization, { type Props } from "./QuitOrganization.js";

//

export default {
  title: "Quit Organization",
  render: QuitOrganization,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    organization_label: "Ministère de la Culture",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
