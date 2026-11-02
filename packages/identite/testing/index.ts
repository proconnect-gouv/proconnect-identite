//

import type { FindMandatairesSociauxBySirenHandler } from "@proconnect-gouv/proconnect.api_entreprise/api/infogreffe";
import type {
  FindBySirenHandler,
  FindBySiretHandler,
} from "@proconnect-gouv/proconnect.api_entreprise/api/insee";
import type { FindPouvoirsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { mock } from "node:test";
import type { FindUniteLegaleBySirenHandler } from "../../insee/src/api/find-by-siren.js";
import type { FindUniteLegaleBySiretHandler } from "../../insee/src/api/find-by-siret.js";
import type { Context } from "../src/types/index.js";

//

const should_not_been_called = () => Promise.reject(new Error("💣"));

export const api_entreprise_mock_client = {
  findBySiren: mock.fn<FindBySirenHandler>(should_not_been_called),
  findBySiret: mock.fn<FindBySiretHandler>(should_not_been_called),
  findMandatairesSociauxBySiren: mock.fn<FindMandatairesSociauxBySirenHandler>(
    should_not_been_called,
  ),
};

export const api_insee_mock_client = {
  findBySiret: mock.fn<FindUniteLegaleBySiretHandler>(should_not_been_called),
  findBySiren: mock.fn<FindUniteLegaleBySirenHandler>(should_not_been_called),
};

export const api_registre_national_entreprises_mock_client = {
  findPouvoirsBySiren: mock.fn<FindPouvoirsBySirenHandler>(
    should_not_been_called,
  ),
};

export const context: Context = {
  client: {
    api_entreprise: api_entreprise_mock_client,
    insee: api_insee_mock_client,
    rne: api_registre_national_entreprises_mock_client,
  },
};
