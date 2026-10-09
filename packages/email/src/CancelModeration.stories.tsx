//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import CancelModeration, { type Props } from "./CancelModeration.js";

//

export default {
  title: "Cancel Moderation",
  render: CancelModeration,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    libelle: "Ministère de la Culture",
  },
} as ComponentAnnotations<Renderer, Props>;
