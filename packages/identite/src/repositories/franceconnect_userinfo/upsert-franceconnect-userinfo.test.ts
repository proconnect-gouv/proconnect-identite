//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it, mock } from "node:test";
import { upsertFranceconnectUserinfoFactory } from "./upsert-franceconnect-userinfo.js";

//

const upsertFranceconnectUserinfo = upsertFranceconnectUserinfoFactory({
  pg: pg as any,
});

describe("upsertFranceconnectUserinfo", () => {
  before(migrate);
  beforeEach(emptyDatabase);
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });
  });

  it("should insert a user franceconnect userinfo", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;

    const user = await upsertFranceconnectUserinfo({
      birthdate: new Date("8888-08-08"),
      birthplace: "Caliban",
      created_at: new Date("4444-04-01"),
      family_name: "El’Jonson",
      gender: "male",
      given_name: "Lion",
      preferred_username: "Li",
      sub: "abcdefghijklmnopqrstuvwxyz",
      updated_at: new Date("4444-04-02"),
      user_id: 1,
    });

    assert.deepEqual(user, {
      birthcountry: null,
      birthdate: new Date("8888-08-08"),
      birthplace: "Caliban",
      created_at: new Date("4444-04-01"),
      family_name: "El’Jonson",
      gender: "male",
      given_name: "Lion",
      preferred_username: "Li",
      sub: "abcdefghijklmnopqrstuvwxyz",
      updated_at: new Date("4444-04-04"),
      user_id: 1,
    });
  });

  it("should update a user Verification link", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO franceconnect_userinfo
        (user_id, created_at, updated_at, given_name)
      VALUES
        (1, '4444-04-01', '4444-04-02', 'Lion')
      ;
    `;

    const user = await upsertFranceconnectUserinfo({
      user_id: 1,
      preferred_username: "Li",
    });

    assert.deepEqual(user, {
      birthcountry: null,
      birthdate: null,
      birthplace: null,
      created_at: new Date("4444-04-01"),
      family_name: null,
      gender: null,
      given_name: "Lion",
      preferred_username: "Li",
      sub: null,
      updated_at: new Date("4444-04-04"),
      user_id: 1,
    });
  });

  it("❎ fail to update an unknown user", async () => {
    await assert.rejects(
      upsertFranceconnectUserinfo({
        user_id: 42,
      }),
      `error: insert or update on table "franceconnect_userinfo" violates foreign key constraint "franceconnect_userinfo_user_id_fkey"`,
    );
  });
});
