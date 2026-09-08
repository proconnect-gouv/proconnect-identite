//

import { describe, it } from "node:test";
import { format } from "prettier";
import QuitOrganization, { type Props } from "./QuitOrganization.js";
import storyConfig from "./QuitOrganization.stories.js";
import "./test-utils.js";

//

describe("QuitOrganization", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<QuitOrganization {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
