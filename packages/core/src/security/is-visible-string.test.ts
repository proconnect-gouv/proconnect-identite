//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isVisibleString } from "./is-visible-string.js";

describe("isVisibleString", () => {
  const nonVisibleStrings = [
    "",
    "\n",
    " ",
    "​", // zero width space character
    "‎", // left to right mark character
    " ​‎",
  ];

  nonVisibleStrings.forEach((nonVisibleString) => {
    it(`should return false for non-visible string: ${nonVisibleString}`, () => {
      assert.equal(isVisibleString(nonVisibleString), false);
    });
  });

  const visibleStrings = ["​a", "a"];

  visibleStrings.forEach((visibleString) => {
    it(`should return true for visible string: ${visibleString}`, () => {
      assert.equal(isVisibleString(visibleString), true);
    });
  });
});
