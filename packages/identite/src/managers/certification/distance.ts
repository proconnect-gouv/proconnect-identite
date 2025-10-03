//

import type { IdentityVector } from "#src/types";
import leven from "leven";

//

// \from https://github.com/date-fns/date-fns/blob/v4.1.0/src/constants/index.ts#L84
export const millisecondsInDay = 86400000;

export function distance(
  franceconnectUserInfo: IdentityVector,
  sourceDirigeant: IdentityVector,
): number {
  const sameGivenName = () =>
    leven(
      franceconnectUserInfo.given_name?.toUpperCase() ||
        Math.random().toString(36),
      sourceDirigeant.given_name?.toUpperCase() || Math.random().toString(36),
    );
  const sameFamilyName = () =>
    leven(
      franceconnectUserInfo.family_name?.toUpperCase() ||
        Math.random().toString(36),
      sourceDirigeant.family_name?.toUpperCase() || Math.random().toString(36),
    );
  const sameBirthDay = () =>
    (Number(sourceDirigeant.birthdate) -
      Number(franceconnectUserInfo.birthdate)) /
    millisecondsInDay;
  const sameBirthPlace = () =>
    leven(
      franceconnectUserInfo.birthplace || Math.random().toString(36),
      sourceDirigeant.birthplace || Math.random().toString(36),
    );

  return [sameGivenName, sameFamilyName, sameBirthDay, sameBirthPlace].reduce(
    (value, metric) => value + metric(),
    0,
  );
}
