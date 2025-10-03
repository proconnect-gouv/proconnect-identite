//

import type { paths } from "#openapi";

//

export type InseeSiretResponse =
  paths["/siret/{siret}"]["get"]["responses"][200]["content"]["application/json"];

export type InseeSiretEstablishment = NonNullable<
  InseeSiretResponse["etablissement"]
>;
