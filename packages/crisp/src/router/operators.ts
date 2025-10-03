//

import type { Operator } from "#src/types";

//

export type OperatorsRouter = {
  /**
   * List Website Operators
   * @see https://docs.crisp.chat/references/rest-api/v1/#list-website-operators
   */
  request: {
    endpoint: `/v1/website/${string}/operators/list`;
    method: "GET";
    //
    searchParams: {};
  };
  response: {
    data: Operator[];
  };
};
