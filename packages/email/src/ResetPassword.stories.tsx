//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import ResetPassword, { type Props } from "./ResetPassword";

//

export default {
  title: "Reset Password",
  render: ResetPassword,
  args: {
    reset_password_link: "#/../src/ResetPassword.stories.tsx",
    baseurl: "http://localhost:3000",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
