//

import { describe, it } from "node:test";
import { format } from "prettier";
import CancelModeration, { type Props } from "./CancelModeration.js";
import storyConfig from "./CancelModeration.stories.js";
import "./test-utils.js";

//

describe("CancelModeration", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<CancelModeration {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
