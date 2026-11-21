import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { FranceConnectUserInfoResponse } from "@proconnect-gouv/proconnect.identite/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { given, userActivity } from "../../testing";
import { franceconnectConnected } from "./franceconnect";

const procedures = { franceconnect: { connected: franceconnectConnected } };

const user_info: FranceConnectUserInfoResponse = {
  birthcountry: "99100",
  birthdate: new Date("1970-01-01"),
  birthplace: "Toulon",
  family_name: "Valjean",
  gender: "male",
  given_name: "Jean Valjean",
  sub: "fc-sub-jean",
};

describe("franceconnect.connected", () => {
  it("✅ journals the date of the first link", async () => {
    const { journal, runtime } = await given({ procedures });

    const outcome = await runtime.franceconnect.connected.mutate({
      user_id: 1,
      user_info,
    });

    assert.equal(outcome.kind, "franceconnect_connected");
    if (outcome.kind !== "franceconnect_connected") return;
    assert.deepEqual(await journal(), [
      userActivity("franceconnect.connected", {
        inputs: {},
        outcome: { connected_at: outcome.connected_at },
      }),
    ]);
  });

  it("✅ a new link keeps the date of the first one", async () => {
    const { db, runtime } = await given({ procedures });
    await db.insert(schema.franceconnect_userinfo).values({
      created_at: "4444-04-04",
      family_name: "Valjean",
      given_name: "Jean",
      sub: "old-sub",
      updated_at: "4444-04-04",
      user_id: 1,
    });

    const outcome = await runtime.franceconnect.connected.mutate({
      user_id: 1,
      user_info,
    });

    assert.equal(outcome.kind, "franceconnect_connected");
    if (outcome.kind !== "franceconnect_connected") return;
    assert.match(outcome.connected_at, /^4444-04-04/);
  });

  it("❎ writes nothing for an unknown user", async () => {
    const { journal, runtime } = await given({ procedures });

    const outcome = await runtime.franceconnect.connected.mutate({
      user_id: 404,
      user_info,
    });

    assert.deepEqual(outcome, { kind: "user_not_found", user_id: 404 });
    assert.deepEqual(await journal(), []);
  });
});
