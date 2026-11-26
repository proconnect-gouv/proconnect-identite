//

import { describe, it } from "node:test";
import { format } from "prettier";
import NewXdaDeviceSignIn, { type Props } from "./NewXdaDeviceSignIn.js";
import storyConfig from "./NewXdaDeviceSignIn.stories.js";
import "./test-utils.js";

//

describe("NewXdaDeviceSignIn", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<NewXdaDeviceSignIn {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});
