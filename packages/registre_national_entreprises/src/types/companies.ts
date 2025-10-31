//

import type { components, paths } from "#openapi";

//

export type CompaniesSirenResponse =
  paths["/companies/{siren}"]["get"]["responses"][200]["content"]["application/json"];

export type Beneficiaire = components["schemas"]["Beneficiaire"];
