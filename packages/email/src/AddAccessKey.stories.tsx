//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import AddAccessKey, { type Props } from "./AddAccessKey";

//

export default {
  title: "Add Access Key",
  render: AddAccessKey,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    baseurl: "http://localhost:3000",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
