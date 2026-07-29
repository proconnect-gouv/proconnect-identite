//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import VerifyEmail, { type Props } from "./VerifyEmail.js";

//

export default {
  title: "Verify Email",
  render: VerifyEmail,
  args: {
    token: "579687",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
