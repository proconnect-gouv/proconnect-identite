//

import { describe, it } from "node:test";
import { format } from "prettier";
import DeleteAccessKey, { type Props } from "./DeleteAccessKey.js";
import storyConfig from "./DeleteAccessKey.stories.js";
import "./test-utils.js";

//

describe("DeleteAccessKey", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<DeleteAccessKey {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
