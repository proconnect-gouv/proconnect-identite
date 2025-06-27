//

import type { paths } from "#openapi";
import createClient from "openapi-fetch";

//

/**
 * Create an Opendatasoft client
 * @see https://help.opendatasoft.com/apis/ods-explore-v2/explore_v2.1.html
 */
export const createOpendatasoftOpenApiClient = createClient<paths>;

export type OpendatasoftOpenApiClient = ReturnType<
  typeof createOpendatasoftOpenApiClient
>;
