//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import OtpEmail, { type Props } from "./OtpEmail.js";

//

export default {
  title: "OTP Email",
  render: OtpEmail,
  args: {
    token: "01928374",
    validityDuration: "1 heure",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
