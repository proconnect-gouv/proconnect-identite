//

import { chain } from "lodash-es";

//

export function hashToPostgresParams<T>(fieldsToUpdate: Partial<T>): {
  // postgres column-list syntax
  paramsString: string;
  // postgres column-list syntax for prepared statement
  valuesString: string;
  values: any[];
} {
  const paramsString = "(" + Object.keys(fieldsToUpdate).join(", ") + ")";
  // 'email, encrypted_password'

  const valuesString =
    "(" +
    chain(fieldsToUpdate)
      // { email: 'email@xy.z', encrypted_password: 'hash' }
      .toPairs()
      // [[ 'email', 'email@xy.z'], ['encrypted_password', 'hash' ]]
      .map((_value, index) => `$${index + 1}`)
      // [ '$1', '$2' ]
      .join(", ")
      // '$1, $2'
      .value() +
    ")";

  const values = Object.values(fieldsToUpdate);
  // [ 'email@xy.z', 'hash' ]

  return { paramsString, valuesString, values };
}
