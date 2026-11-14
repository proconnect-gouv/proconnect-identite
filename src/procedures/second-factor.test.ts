import { hashPassword } from "@proconnect-gouv/proconnect.core/security";
import {
  authenticators,
  recovery_words,
  users,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Secret, TOTP } from "otpauth";
import { given, userActivity } from "../../testing";
import {
  userAccountRecovered,
  userForce2faDisabled,
  userForce2faEnabled,
  userPasskeyRemoved,
  userRecoveryWordsRegenerated,
  userTotpAdded,
  userTotpRemoved,
} from "./second-factor";

const procedures = {
  user: {
    account_recovered: userAccountRecovered,
    force_2fa_enabled: userForce2faEnabled,
    force_2fa_disabled: userForce2faDisabled,
    passkey_removed: userPasskeyRemoved,
    recovery_words_regenerated: userRecoveryWordsRegenerated,
    totp_added: userTotpAdded,
    totp_removed: userTotpRemoved,
  },
};

function validTotpToken(secret: string) {
  return new TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  }).generate();
}

describe("user.force_2fa_enabled", () => {
  it("✅ journals a row when a second factor is configured", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db
      .update(users)
      .set({ encrypted_totp_key: "🔐" })
      .where(eq(users.id, 1));

    await runtime.user.force_2fa_enabled.mutate({ user_id: 1 });

    assert.deepEqual(await journal(), [
      userActivity("user.force_2fa_enabled", { inputs: {}, outcome: {} }),
    ]);
  });

  it("❎ writes nothing when already enabled", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db
      .update(users)
      .set({ encrypted_totp_key: "🔐", force_2fa: true })
      .where(eq(users.id, 1));

    const outcome = await runtime.user.force_2fa_enabled.mutate({ user_id: 1 });

    assert.deepEqual(outcome, { kind: "force_2fa_unchanged" });
    assert.deepEqual(await journal(), []);
  });

  it("❎ writes nothing without any second factor", async () => {
    const { journal, runtime } = await given({ procedures });

    const outcome = await runtime.user.force_2fa_enabled.mutate({ user_id: 1 });

    assert.deepEqual(outcome, { kind: "not_2fa_capable" });
    assert.deepEqual(await journal(), []);
  });
});

describe("user.totp_added", () => {
  it("❎ writes nothing for an invalid code", async () => {
    const { journal, runtime } = await given({ procedures });

    const outcome = await runtime.user.totp_added.mutate({
      temporary_totp_key: new Secret().base32,
      totp_token: "000000",
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "invalid_totp_token" });
    assert.deepEqual(await journal(), []);
  });

  it("✅ journals a row with previous.totp_configured false for a valid code", async () => {
    const { journal, runtime } = await given({ procedures });
    const secret = new Secret().base32;

    await runtime.user.totp_added.mutate({
      temporary_totp_key: secret,
      totp_token: validTotpToken(secret),
      user_id: 1,
    });

    assert.deepEqual(await journal(), [
      userActivity("user.totp_added", {
        inputs: {},
        outcome: { previous: { totp_configured: false } },
      }),
    ]);
  });
});

describe("user.totp_removed", () => {
  it("✅ disables forced 2FA after removing the only factor", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db
      .update(users)
      .set({ encrypted_totp_key: "🔐", force_2fa: true })
      .where(eq(users.id, 1));

    await runtime.user.totp_removed.mutate({ source: "self", user_id: 1 });

    assert.deepEqual(await journal(), [
      userActivity("user.force_2fa_disabled", {
        inputs: { reason: "totp_removed" },
        outcome: {},
      }),
      userActivity("user.totp_removed", {
        inputs: { source: "self" },
        outcome: {},
      }),
    ]);
  });
});

describe("user.passkey_removed", () => {
  it("❎ writes nothing for an unknown credential", async () => {
    const { journal, runtime } = await given({ procedures });

    const outcome = await runtime.user.passkey_removed.mutate({
      credential_id: "unknown",
      source: "self",
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "passkey_not_found" });
    assert.deepEqual(await journal(), []);
  });
});

describe("user.recovery_words_regenerated", () => {
  it("✅ journals previous false then true across two calls", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db
      .update(users)
      .set({ encrypted_totp_key: "🔐" })
      .where(eq(users.id, 1));

    await runtime.user.recovery_words_regenerated.mutate({
      hashed_words: await hashPassword("first phrase"),
      user_id: 1,
    });
    await runtime.user.recovery_words_regenerated.mutate({
      hashed_words: await hashPassword("second phrase"),
      user_id: 1,
    });

    assert.deepEqual(await journal(), [
      userActivity("user.recovery_words_regenerated", {
        inputs: {},
        outcome: { previous: { recovery_words_configured: false } },
      }),
      userActivity("user.recovery_words_regenerated", {
        inputs: {},
        outcome: { previous: { recovery_words_configured: true } },
      }),
    ]);
  });
});

describe("user.account_recovered", () => {
  it("❎ writes nothing for wrong recovery words", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db.insert(recovery_words).values({
      hashed_words: await hashPassword("right phrase"),
      user_id: 1,
    });

    const outcome = await runtime.user.account_recovered.mutate({
      recovery_words: "wrong phrase",
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "invalid_recovery_words" });
    assert.deepEqual(await journal(), []);
  });

  it("✅ removes every factor then journals account_recovered", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db
      .update(users)
      .set({ encrypted_totp_key: "🔐", force_2fa: true })
      .where(eq(users.id, 1));
    await db.insert(authenticators).values({
      counter: 0,
      credential_backed_up: true,
      credential_id: "passkey",
      credential_public_key: new Uint8Array(),
      user_id: 1,
    });
    await db.insert(recovery_words).values({
      hashed_words: await hashPassword("right phrase"),
      user_id: 1,
    });

    await runtime.user.account_recovered.mutate({
      recovery_words: "right phrase",
      user_id: 1,
    });

    assert.deepEqual(await journal(), [
      userActivity("user.passkey_removed", {
        inputs: { credential_id: null, source: "account_recovery" },
        outcome: { removed: 1 },
      }),
      userActivity("user.force_2fa_disabled", {
        inputs: { reason: "account_recovery" },
        outcome: {},
      }),
      userActivity("user.totp_removed", {
        inputs: { source: "account_recovery" },
        outcome: {},
      }),
      userActivity("user.account_recovered", { inputs: {}, outcome: {} }),
    ]);
  });
});
