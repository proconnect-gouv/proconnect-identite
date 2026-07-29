//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import Add2fa, { type Props } from "./Add2fa.js";

//

export default {
  title: "Add 2FA",
  render: Add2fa,
  args: {
    email: "marie.dupont@example.com",
    family_name: "Dupont",
    given_name: "Marie",
  } satisfies Props,
} as ComponentAnnotations<Renderer, Props>;
