//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import OfficialContactEmailVerification, {
  type Props,
} from "./OfficialContactEmailVerification";

//

export default {
  title: "Official contact email verification",
  render: OfficialContactEmailVerification,
  args: {
    email: "marie.dupont@ville.fr",
    family_name: "Dupont",
    given_name: "Marie",
    libelle: "Commune de Michel",
    token: "contrit-muscle",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
