//

import { describe, it } from "node:test";
import { format } from "prettier";
import VerifiedDeviceLink, { type Props } from "./VerifiedDeviceLink.js";
import storyConfig from "./VerifiedDeviceLink.stories.js";
import "./test-utils.js";

//

describe("VerifiedDeviceLink", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<VerifiedDeviceLink {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});
