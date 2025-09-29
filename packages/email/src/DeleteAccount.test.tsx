//

import { describe, it } from "node:test";
import { format } from "prettier";
import DeleteAccount, { type Props } from "./DeleteAccount.js";
import storyConfig from "./DeleteAccount.stories.js";
import "./test-utils.js";

//

describe("DeleteAccount", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<DeleteAccount {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
