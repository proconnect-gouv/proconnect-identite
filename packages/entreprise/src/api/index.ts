//

import type { FindMandatairesSociauxBySirenHandler } from "./infogreffe/index.js";
import type { FindBySirenHandler, FindBySiretHandler } from "./insee/index.js";

export interface ApiEntrepriseInseeRepository {
  findBySiren: FindBySirenHandler;
  findBySiret: FindBySiretHandler;
}

export interface ApiEntrepriseInfogreffeRepository {
  findMandatairesSociauxBySiren: FindMandatairesSociauxBySirenHandler;
}
