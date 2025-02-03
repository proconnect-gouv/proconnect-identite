//

import { emptyDatabase, migrate, pg } from "#testing";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import assert from "node:assert";
import { getFranceConnectUserInfoFactory } from "./get-franceconnect-user-info.js";

//

const getFranceConnectUserInfo = getFranceConnectUserInfoFactory({
  pg: pg as any,
});

describe("getFranceConnectUserInfo", () => {
  before(migrate);
  beforeEach(emptyDatabase);
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
        (user_id, given_name)
      VALUES
        (1, 'Li')
      ;
    `;

    const user = await getFranceConnectUserInfo(1);
    assert.ok(user);
    expect(user.given_name).to.equal("Li");
  });

  it("❎ fail to get an unknown user", async () => {
    const user = await getFranceConnectUserInfo(42);

    expect(user).to.be.undefined;
  });
});
