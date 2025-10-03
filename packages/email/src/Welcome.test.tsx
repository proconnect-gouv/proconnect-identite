//

import { describe, it } from "node:test";
import { format } from "prettier";
import Welcome, { type Props } from "./Welcome.js";
import storyConfig from "./Welcome.stories.js";
import "./test-utils.js";

//

describe("Welcome", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<Welcome {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
