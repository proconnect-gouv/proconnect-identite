//

import { describe, it } from "node:test";
import { format } from "prettier";
import DeleteFreeTotpMail, { type Props } from "./DeleteFreeTotpMail.js";
import storyConfig from "./DeleteFreeTotpMail.stories.js";
import "./test-utils.js";

//

describe("DeleteFreeTotpMail", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<DeleteFreeTotpMail {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
