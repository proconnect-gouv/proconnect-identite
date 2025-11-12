//

import type { FranceConnectUserInfo, IdentityVector } from "#src/types";
import { match } from "ts-pattern";

//

export function toIdentityVector(
  userInfo: FranceConnectUserInfo,
): IdentityVector {
  return {
    birthcountry: userInfo.birthcountry,
    birthdate: userInfo.birthdate,
    birthplace: userInfo.birthplace,
    family_name: userInfo.family_name,
    gender: match(userInfo.gender.toLowerCase())
      .with("male", "female", (value) => value)
      .otherwise(() => null),
    given_name: userInfo.given_name,
  };
}
