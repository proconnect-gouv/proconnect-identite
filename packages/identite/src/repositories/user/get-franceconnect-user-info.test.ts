//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it, mock } from "node:test";
import { getFranceConnectUserInfoFactory } from "./get-franceconnect-user-info.js";

//

const getFranceConnectUserInfo = getFranceConnectUserInfoFactory({
  pg: pg as any,
});

describe("getFranceConnectUserInfo", () => {
  before(migrate);
  beforeEach(emptyDatabase);
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });
  });

  it("should get franceconnect user info", async () => {
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
        (1, '8888-08-08', 'Caliban', 'El’Jonson', 'male', 'Li', 'Li', 'abcdefghijklmnopqrstuvwxyz', '4444-04-04', '4444-04-04')
      ;
    `;

    const user = await getFranceConnectUserInfo(1);
    assert.ok(user);
    assert.deepEqual(user, {
      birthdate: new Date("8888-08-08"),
      birthplace: "Caliban",
      created_at: new Date("4444-04-04"),
      family_name: "El’Jonson",
      gender: "male",
      given_name: "Li",
      preferred_username: "Li",
      sub: "abcdefghijklmnopqrstuvwxyz",
      updated_at: new Date(),
      user_id: 1,
    });
  });

  it("❎ fail to get an unknown user", async () => {
    const user = await getFranceConnectUserInfo(42);

    assert.equal(user, undefined);
  });
});
