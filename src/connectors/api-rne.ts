//

import {
  findBySirenFactory,
  getRegistreNationalEntreprisesAccessTokenFactory,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { createRegistreNationalEntreprisesOpenApiClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/client";
import { RNE_API_PASSWORD, RNE_API_USERNAME } from "../config/env";

//

export const RegistreNationalEntreprisesApiRepository = {
  async findBySiren(siren: string) {
    const client = await get_client();
    return findBySirenFactory(client)(siren);
  },
};

//

const get_access_token = getRegistreNationalEntreprisesAccessTokenFactory({
  password: RNE_API_PASSWORD,
  username: RNE_API_USERNAME,
});

async function get_client() {
  const token = await get_access_token();
  return createRegistreNationalEntreprisesOpenApiClient(token);
}
