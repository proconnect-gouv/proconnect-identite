//

import { describe, it } from "node:test";
import { format } from "prettier";
import ModerationProcessed, { type Props } from "./ModerationProcessed.js";
import storyConfig from "./ModerationProcessed.stories.js";
import "./test-utils.js";

//

describe("ModerationProcessed", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<ModerationProcessed {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});
