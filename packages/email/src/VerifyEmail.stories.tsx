//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import VerifyEmail, { type Props } from "./VerifyEmail";

//

export default {
  title: "Verify Email",
  render: VerifyEmail,
  args: {
    baseurl: "http://localhost:3000",
    token: "579687",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
