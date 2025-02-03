//

import { emptyDatabase, migrate, pg } from "#testing";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import { upsertFranceconnectUserinfoFactory } from "./upsert-franceconnect-userinfo.js";

//

const upsertFranceconnectUserinfo = upsertFranceconnectUserinfoFactory({
  pg: pg as any,
});

describe("upsertFranceconnectUserinfo", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should insert a user franceconnect userinfo", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;

    const user = await upsertFranceconnectUserinfo({
      created_at: new Date("4444-04-01"),
      updated_at: new Date("4444-04-02"),
      user_id: 1,
    });

    expect(user.created_at).to.deep.equal(new Date("4444-04-01"));
    expect(user.updated_at).to.not.deep.equal(new Date("4444-04-02"));
    expect(user.user_id).to.deep.equal(1);
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

    expect(user.created_at).to.deep.equal(new Date("4444-04-01"));
    expect(user.updated_at).to.not.deep.equal(new Date("4444-04-02"));
    expect(user.user_id).to.deep.equal(1);
    expect(user.preferred_username).to.deep.equal("Li");
  });

  it("❎ fail to update an unknown user", async () => {
    await expect(
      upsertFranceconnectUserinfo({
        user_id: 42,
      }),
    ).to.rejectedWith(
      `insert or update on table "franceconnect_userinfo" violates foreign key constraint "franceconnect_userinfo_user_id_fkey"`,
    );
  });
});
