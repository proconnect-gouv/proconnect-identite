//

import type { FranceConnectUserInfo, IdentityVector } from "#src/types";

//

export function toIdentityVector(
  userInfo: FranceConnectUserInfo,
): IdentityVector {
  // Map FranceConnect gender to standard format
  const mapGender = (gender: string | undefined) => {
    const lowerGender = gender?.toLowerCase();
    if (lowerGender === "male" || lowerGender === "m") return "male";
    if (lowerGender === "female" || lowerGender === "f") return "female";
    return null;
  };

  return {
    birthplace: userInfo.birthplace,
    birthdate: userInfo.birthdate,
    family_name: userInfo.family_name,
    gender: mapGender(userInfo.gender),
    given_name: userInfo.given_name,
  };
}
