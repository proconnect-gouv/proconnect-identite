//

import { describe, it } from "node:test";
import { format } from "prettier";
import RecoveryWordsGenerated, {
  type Props,
} from "./RecoveryWordsGenerated.js";
import storyConfig from "./RecoveryWordsGenerated.stories.js";
import "./test-utils.js";

//

describe("RecoveryWordsGenerated", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<RecoveryWordsGenerated {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});
