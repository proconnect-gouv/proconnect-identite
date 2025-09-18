//

import { describe, it } from "node:test";
import { format } from "prettier";
import Add2fa, { type Props } from "./Add2fa.js";
import storyConfig from "./Add2fa.stories.js";
import "./test-utils.js";

//

describe("Add2fa", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<Add2fa {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});
