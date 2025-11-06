//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import ModerationProcessed, { type Props } from "./ModerationProcessed";

//

export default {
  title: "ModerationProcessed",
  render: ModerationProcessed,
  args: {
    baseurl: "http://localhost:3000",
    libelle: "Ministère de l'Éducation nationale",
    email: "marie.dupont@example.com",
  } satisfies Props,
} as ComponentAnnotations<Renderer, Props>;
