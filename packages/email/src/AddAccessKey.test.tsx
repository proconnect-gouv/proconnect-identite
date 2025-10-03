//

import { describe, it } from "node:test";
import { format } from "prettier";
import AddAccessKey, { type Props } from "./AddAccessKey.js";
import storyConfig from "./AddAccessKey.stories.js";
import "./test-utils.js";

//

describe("AddAccessKey", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<AddAccessKey {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
