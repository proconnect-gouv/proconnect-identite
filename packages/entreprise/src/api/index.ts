//

import type { FindMandatairesSociauxBySirenHandler } from "./infogreffe/index.js";
import type { FindBySirenHandler, FindBySiretHandler } from "./insee/index.js";

export interface EntrepriseApiInseeRepository {
  findBySiren: FindBySirenHandler;
  findBySiret: FindBySiretHandler;
}

export interface EntrepriseApiInfogreffeRepository {
  findMandatairesSociauxBySiren: FindMandatairesSociauxBySirenHandler;
}
