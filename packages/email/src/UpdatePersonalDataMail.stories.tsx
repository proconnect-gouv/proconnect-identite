//

import type {
  ComponentAnnotations,
  Renderer,
  StoryAnnotations,
} from "@storybook/csf";
import UpdatePersonalDataMail, { type Props } from "./UpdatePersonalDataMail";

//
export default {
  title: "Update Personal Data",
  render: UpdatePersonalDataMail,
  args: {
    baseurl: "http://localhost:3000",
    given_name: "Maarie",
    family_name: "Duupont",
    updatedFields: {
      family_name: {
        new: "Dupont",
        old: "Duupont",
      },
      given_name: {
        new: "Marie",
        old: "Maarie",
      },
      job: {
        new: "Cheffe de projet",
        old: "Chef de projet",
      },
      phone_number: {
        new: "0123456789",
        old: "9876543210",
      },
    },
  },
} as ComponentAnnotations<Renderer, Props>;

export const UpdateOnlyName: StoryAnnotations<Renderer, Props> = {
  name: "Update only names",
  args: {
    updatedFields: {
      family_name: {
        new: "Dupont",
        old: "Dupont",
      },
      given_name: {
        new: "Marie",
        old: "Marie",
      },
    },
  },
};
