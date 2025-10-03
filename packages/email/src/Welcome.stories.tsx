//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import Welcome, { type Props } from "./Welcome";

//

export default {
  title: "Welcome",
  render: Welcome,
  args: {
    baseurl: "#/../src/Welcome.stories.tsx",
    family_name: "Dupont",
    given_name: "Marie",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
