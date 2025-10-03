//

import { describe, it } from "node:test";
import { format } from "prettier";
import OfficialContactEmailVerification, {
  type Props,
} from "./OfficialContactEmailVerification.js";
import storyConfig from "./OfficialContactEmailVerification.stories.js";
import "./test-utils.js";

//

describe("OfficialContactEmailVerification", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (
      <OfficialContactEmailVerification {...props} />
    ).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
