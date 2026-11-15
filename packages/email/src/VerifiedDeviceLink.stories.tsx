//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import VerifiedDeviceLink, { type Props } from "./VerifiedDeviceLink.js";

//

export default {
  title: "Verified Device Link",
  render: VerifiedDeviceLink,
  args: {
    xda_link: "proconnect.gouv.fr/xda",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
