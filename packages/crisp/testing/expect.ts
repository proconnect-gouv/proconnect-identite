import {
  JestAsymmetricMatchers,
  JestChaiExpect,
  JestExtend,
  type ExpectStatic,
} from "@vitest/expect";
import * as chai from "chai";

// From https://github.com/vitest-dev/vitest/tree/v2.1.8/packages/expect

// allows using expect.extend instead of chai.use to extend plugins
chai.use(JestExtend);
// adds all jest matchers to expect
chai.use(JestChaiExpect);
// adds asymmetric matchers like stringContaining, objectContaining
chai.use(JestAsymmetricMatchers);

export const expect = chai.expect as ExpectStatic;
