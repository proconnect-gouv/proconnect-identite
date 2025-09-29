//

import { describe, it } from "node:test";
import { format } from "prettier";
import UpdatePersonalDataMail, {
  type Props,
} from "./UpdatePersonalDataMail.js";
import storyConfig, {
  UpdateOnlyName,
} from "./UpdatePersonalDataMail.stories.js";
import "./test-utils.js";

//

describe("UpdatePersonalDataMail", () => {
  it("should render default story", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<UpdatePersonalDataMail {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });

  it("should render UpdateOnlyName story", async (t) => {
    const baseProps = storyConfig.args as Props;
    const storyProps = { ...baseProps, ...UpdateOnlyName.args };
    const rendered = (<UpdatePersonalDataMail {...storyProps} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
