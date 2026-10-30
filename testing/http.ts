import {
  email_domains,
  organizations,
  users,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import { createHmac, randomUUID } from "node:crypto";

process.env["NODE_ENV"] = "test";
process.env["DATABASE_URL"] ??=
  "postgres://proconnect-identite:proconnect-identite@127.0.0.1:5432/proconnect-identite";
process.env["ENTREPRISE_API_URL"] ??=
  "http://localhost:3000/___testing___/entreprise.api.gouv.fr";
process.env["FEATURE_MOUNT_MOCKED_EXTERNAL_APIS"] ??= "False";
process.env["FRANCECONNECT_ISSUER"] ??=
  "http://localhost:3000/___testing___/oidc.franceconnect.gouv.fr/api/v2";
process.env["REDIS_URL"] ??= "redis://127.0.0.1:6379";
process.env["RNE_API_BASE_URL"] ??=
  "http://localhost:3000/___testing___/registre-national-entreprises.inpi.fr";
process.env["SMTP_URL"] ??= "smtp://localhost:1025";

// shortcut: await import keeps src/config/env after the env assignments above
const { SESSION_COOKIE_SECRET } = await import("../src/config/env");
const { createApp } = await import("../src/app");
const { db } = await import("../src/connectors/context");
const { getDatabaseConnection } = await import("../src/connectors/postgres");
const { getNewRedisClient } = await import("../src/connectors/redis");

const SESSION_COOKIE_NAME = "session";
const SESSION_STORE_PREFIX = "mcp:session:";

const to_date = (value: Date | string | null) =>
  value === null ? null : new Date(value);

export { createApp, db };

export async function close_connections() {
  await getNewRedisClient().quit();
  await getNewRedisClient({ disableOfflineQueue: true }).quit();
  await getDatabaseConnection().end();
}

export async function create_session_cookie({ user_id }: { user_id: number }) {
  const [row] = await db.select().from(users).where(eq(users.id, user_id));

  const user: User = {
    ...row,
    created_at: new Date(row.created_at),
    email_verified_at: to_date(row.email_verified_at),
    last_sign_in_at: to_date(row.last_sign_in_at),
    magic_link_sent_at: to_date(row.magic_link_sent_at),
    reset_password_sent_at: to_date(row.reset_password_sent_at),
    totp_key_verified_at: to_date(row.totp_key_verified_at),
    updated_at: new Date(row.updated_at),
    verify_email_sent_at: to_date(row.verify_email_sent_at),
  };

  const sid = randomUUID();

  await getNewRedisClient().set(
    `${SESSION_STORE_PREFIX}${sid}`,
    JSON.stringify({
      amr: ["pwd"],
      cookie: {
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        httpOnly: true,
        path: "/",
      },
      user,
    }),
  );

  const signature = createHmac("sha256", SESSION_COOKIE_SECRET[0])
    .update(sid)
    .digest("base64")
    .replace(/=+$/, "");

  return `${SESSION_COOKIE_NAME}=s:${sid}.${signature}`;
}

export async function delete_suggestion_fixture({
  domain,
  organization_id,
  user_id,
}: {
  domain: string;
  organization_id: number;
  user_id: number;
}) {
  await db.delete(email_domains).where(eq(email_domains.domain, domain));
  await db.delete(organizations).where(eq(organizations.id, organization_id));
  await db.delete(users).where(eq(users.id, user_id));
}
