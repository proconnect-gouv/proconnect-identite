import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { given, userActivity } from "../../testing";
import { userEmailVerified } from "./email";

const procedures = {
  user: { email_verified: userEmailVerified },
};

describe("user.email_verified", () => {
  it("✅ journals a first verification by email code", async () => {
    const { db, journal, runtime } = await given({ procedures });

    await db
      .update(users)
      .set({ verify_email_sent_at: new Date(), verify_email_token: "123456" })
      .where(eq(users.id, 1));

    await runtime.user.email_verified.mutate({
      source: "verify_email",
      token: "123456",
      user_id: 1,
    });

    assert.deepEqual(await journal(), [
      userActivity("user.email_verified", {
        inputs: { source: "verify_email" },
        outcome: { previous: { email_verified: false } },
      }),
    ]);
  });

  it("✅ journals a first verification by magic link", async () => {
    const { db, journal, runtime } = await given({ procedures });

    await db
      .update(users)
      .set({ magic_link_sent_at: new Date(), magic_link_token: "link-token" })
      .where(eq(users.id, 1));

    await runtime.user.email_verified.mutate({
      source: "magic_link",
      token: "link-token",
      user_id: 1,
    });

    assert.deepEqual(await journal(), [
      userActivity("user.email_verified", {
        inputs: { source: "magic_link" },
        outcome: { previous: { email_verified: false } },
      }),
    ]);
  });

  it("✅ journals an email code renewal with the previous state", async () => {
    const { db, journal, runtime } = await given({ procedures });
    const verified_at = new Date("2000-01-01");

    await db
      .update(users)
      .set({
        email_verified: true,
        email_verified_at: verified_at,
        verify_email_sent_at: new Date(),
        verify_email_token: "654321",
      })
      .where(eq(users.id, 1));

    await runtime.user.email_verified.mutate({
      source: "verify_email",
      token: "654321",
      user_id: 1,
    });

    const user = await db.query.users.findFirst();
    assert.ok(
      (user?.email_verified_at?.getTime() ?? 0) > verified_at.getTime(),
    );

    assert.deepEqual(await journal(), [
      userActivity("user.email_verified", {
        inputs: { source: "verify_email" },
        outcome: { previous: { email_verified: true } },
      }),
    ]);
  });

  it("❎ writes no row for a magic-link sign-in by a verified user", async () => {
    const { db, journal, runtime } = await given({ procedures });
    const verified_at = new Date("2000-01-01");

    await db
      .update(users)
      .set({
        email_verified: true,
        email_verified_at: verified_at,
        magic_link_sent_at: new Date(),
        magic_link_token: "relink",
      })
      .where(eq(users.id, 1));

    await runtime.user.email_verified.mutate({
      source: "magic_link",
      token: "relink",
      user_id: 1,
    });

    const user = await db.query.users.findFirst();
    assert.ok(
      (user?.email_verified_at?.getTime() ?? 0) > verified_at.getTime(),
    );
    assert.equal(user?.magic_link_token, null);
    assert.deepEqual(await journal(), []);
  });

  it("❎ writes nothing when the token is expired", async () => {
    const { db, journal, runtime } = await given({ procedures });

    await db
      .update(users)
      .set({
        verify_email_sent_at: new Date("2000-01-01"),
        verify_email_token: "123456",
      })
      .where(eq(users.id, 1));

    const outcome = await runtime.user.email_verified.mutate({
      source: "verify_email",
      token: "123456",
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "token_expired" });
    const user = await db.query.users.findFirst();
    assert.equal(user?.email_verified, false);
    assert.equal(user?.verify_email_token, "123456");
    assert.deepEqual(await journal(), []);
  });

  it("❎ writes nothing when the token does not match", async () => {
    const { db, journal, runtime } = await given({ procedures });

    await db
      .update(users)
      .set({ magic_link_sent_at: new Date(), magic_link_token: "expected" })
      .where(eq(users.id, 1));

    const outcome = await runtime.user.email_verified.mutate({
      source: "magic_link",
      token: "other",
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "invalid_token" });
    assert.deepEqual(await journal(), []);
  });
});
