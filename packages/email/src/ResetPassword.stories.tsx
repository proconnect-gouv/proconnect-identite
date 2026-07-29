//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import ResetPassword, { type Props } from "./ResetPassword.js";

//

export default {
  title: "Reset Password",
  render: ResetPassword,
  args: {
    reset_password_link: "#/../src/ResetPassword.stories.tsx",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
