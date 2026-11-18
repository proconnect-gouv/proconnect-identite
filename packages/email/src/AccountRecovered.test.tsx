//

import { describe, it } from "node:test";
import { format } from "prettier";
import AccountRecovered, { type Props } from "./AccountRecovered.js";
import storyConfig from "./AccountRecovered.stories.js";
import "./test-utils.js";

//

describe("AccountRecovered", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<AccountRecovered {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});

//
