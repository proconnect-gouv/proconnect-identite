//

import { describe, it } from "node:test";
import { format } from "prettier";
import Delete2faProtection, { type Props } from "./Delete2faProtection.js";
import storyConfig from "./Delete2faProtection.stories.js";
import "./test-utils.js";

//

describe("Delete2faProtection", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<Delete2faProtection {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
