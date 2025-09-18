//

import { describe, it } from "node:test";
import { format } from "prettier";
import VerifyEmail, { type Props } from "./VerifyEmail.js";
import storyConfig from "./VerifyEmail.stories.js";
import "./test-utils.js";

//

describe("VerifyEmail", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<VerifyEmail {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
