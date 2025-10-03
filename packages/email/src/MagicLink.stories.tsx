//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import MagicLink, { type Props } from "./MagicLink";

//

export default {
  title: "Magic Link",
  render: MagicLink,
  args: {
    baseurl: "http://localhost:3000",
    magic_link: "#/../src/MagicLink.stories.tsx",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
