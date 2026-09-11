//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import PasswordChanged, { type Props } from "./PasswordChanged.js";

//

export default {
  title: "Password Changed",
  render: PasswordChanged,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
