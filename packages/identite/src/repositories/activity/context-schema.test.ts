import assert from "node:assert";
import { describe, it } from "node:test";
import { activityContextSchema } from "./context-schema";

describe("activityContextSchema", () => {
  it("accepts a context matching its action", () => {
    const result = activityContextSchema.safeParse({
      action: "personal_info_edited",
      context: {
        before: { given_name: "Imotekh" },
        after: { given_name: "Trazyn" },
      },
    });
    assert.strictEqual(result.success, true);
  });

  it("rejects a context shape that doesn't match the action", () => {
    const result = activityContextSchema.safeParse({
      action: "franceconnect_data_sync",
      context: { before: {}, after: {} },
    });
    assert.strictEqual(result.success, false);
  });

  it("rejects an unknown action", () => {
    const result = activityContextSchema.safeParse({
      action: "not_a_real_action",
      context: {},
    });
    assert.strictEqual(result.success, false);
  });
});
