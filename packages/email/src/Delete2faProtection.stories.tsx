//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import Delete2faProtection, { type Props } from "./Delete2faProtection";

//

export default {
  title: "Delete 2FA Protection",
  render: Delete2faProtection,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    baseurl: "http://localhost:3000",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
