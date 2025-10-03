//

import { describe, it } from "node:test";
import { format } from "prettier";
import MagicLink, { type Props } from "./MagicLink.js";
import storyConfig from "./MagicLink.stories.js";
import "./test-utils.js";

//

describe("MagicLink", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<MagicLink {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
