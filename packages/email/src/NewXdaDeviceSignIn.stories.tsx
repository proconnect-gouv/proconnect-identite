//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import NewXdaDeviceSignIn, { type Props } from "./NewXdaDeviceSignIn.js";

//

export default {
  title: "New XDA Device Sign In",
  render: NewXdaDeviceSignIn,
  args: {
    sp_name: "Tchap",
    support_link: "https://proconnect.crisp.help/fr/",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
