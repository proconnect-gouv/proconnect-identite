//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import Add2fa, { type Props } from "./Add2fa";

//

export default {
  title: "Add 2FA",
  render: Add2fa,
  args: {
    baseurl: "http://localhost:3000",
    email: "marie.dupont@example.com",
    family_name: "Dupont",
    given_name: "Marie",
  } satisfies Props,
} as ComponentAnnotations<Renderer, Props>;
