//

import { describe, it } from "node:test";
import { format } from "prettier";
import ResetPassword, { type Props } from "./ResetPassword.js";
import storyConfig from "./ResetPassword.stories.js";
import "./test-utils.js";

//

describe("ResetPassword", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<ResetPassword {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
