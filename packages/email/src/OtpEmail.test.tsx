//

import { describe, it } from "node:test";
import { format } from "prettier";
import OtpEmail, { type Props } from "./OtpEmail.js";
import storyConfig from "./OtpEmail.stories.js";
import "./test-utils.js";

//

describe("OtpEmail", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<OtpEmail {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
