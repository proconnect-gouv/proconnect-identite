//

import type { paths } from "#openapi";

//

export type InseeSirenResponse =
  paths["/siren/{siren}"]["get"]["responses"][200]["content"]["application/json"];

export type InseSirenUniteLegale = NonNullable<
  InseeSirenResponse["uniteLegale"]
>;
