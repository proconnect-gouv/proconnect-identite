//

import { describe, it } from "node:test";
import { format } from "prettier";
import PasswordChanged, { type Props } from "./PasswordChanged.js";
import storyConfig from "./PasswordChanged.stories.js";
import "./test-utils.js";

//

describe("PasswordChanged", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<PasswordChanged {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
