import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { given, userActivity } from "../../testing";
import { userInfoChanged, userPasswordChanged } from "./profile";

const procedures = {
  user: {
    info_changed: userInfoChanged,
    password_changed: userPasswordChanged,
  },
};

describe("user.info_changed", () => {
  it("✅ journals the previous and next value of each changed field only", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db
      .update(schema.users)
      .set({ family_name: "Valjean", given_name: "Jean" });

    await runtime.user.info_changed.mutate({
      family_name: "Valjean",
      given_name: "Jehan",
      job: "Maire",
      user_id: 1,
    });

    assert.deepEqual(await journal(), [
      userActivity("user.info_changed", {
        inputs: {},
        outcome: {
          next: { given_name: "Jehan", job: "Maire" },
          previous: { given_name: "Jean", job: null },
        },
      }),
    ]);
  });

  it("❎ writes nothing when no field changes", async () => {
    const { journal, runtime } = await given({ procedures });

    const outcome = await runtime.user.info_changed.mutate({
      given_name: null,
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "info_unchanged", user_id: 1 });
    assert.deepEqual(await journal(), []);
  });

  it("❎ writes nothing for an unknown user", async () => {
    const { journal, runtime } = await given({ procedures });

    const outcome = await runtime.user.info_changed.mutate({
      given_name: "Jean",
      user_id: 42,
    });

    assert.deepEqual(outcome, { kind: "user_not_found", user_id: 42 });
    assert.deepEqual(await journal(), []);
  });
});

describe("user.password_changed", () => {
  it("✅ a reset verifies the email and journals the previous state", async () => {
    const { db, journal, runtime } = await given({ procedures });

    await runtime.user.password_changed.mutate({
      encrypted_password: "hashed",
      source: "reset_password",
      user_id: 1,
    });

    const user = await db.query.users.findFirst();
    assert.equal(user?.email_verified, true);
    assert.deepEqual(await journal(), [
      userActivity("user.password_changed", {
        inputs: { source: "reset_password" },
        outcome: { previous: { email_verified: false } },
      }),
    ]);
  });

  it("✅ a first password at signup leaves the email unverified", async () => {
    const { db, runtime } = await given({ procedures });

    await runtime.user.password_changed.mutate({
      encrypted_password: "hashed",
      source: "signup",
      user_id: 1,
    });

    const user = await db.query.users.findFirst();
    assert.equal(user?.email_verified, false);
    assert.equal(user?.email_verified_at, null);
  });
});
