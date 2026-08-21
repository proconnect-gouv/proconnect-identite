//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { deleteFranceConnectUserInfoFactory } from "./delete-franceconnect-userinfo.js";
import { getFranceConnectUserInfoFactory } from "./get-franceconnect-user-info.js";

//

const deleteFranceConnectUserInfo = deleteFranceConnectUserInfoFactory({
  pg: pg as any,
});
const getFranceConnectUserInfo = getFranceConnectUserInfoFactory({
  pg: pg as any,
});

describe("deleteFranceConnectUserInfo", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should delete franceconnect user info", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO franceconnect_userinfo
        (user_id, birthdate, birthplace, family_name, gender, given_name, preferred_username, sub, created_at, updated_at)
        VALUES
        (1, '8888-08-08', 'Caliban', 'El''Jonson', 'male', 'Li', 'Li', 'abcdefghijklmnopqrstuvwxyz', '4444-04-04', '4444-04-04')
      ;
    `;

    await deleteFranceConnectUserInfo(1);

    const user = await getFranceConnectUserInfo(1);
    assert.equal(user, undefined);
  });

  it("should not throw when deleting a user_id with no row", async () => {
    await assert.doesNotReject(() => deleteFranceConnectUserInfo(42));
  });
});
