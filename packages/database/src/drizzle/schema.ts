import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const users_oidc_clients = pgTable(
  "users_oidc_clients",
  {
    user_id: integer().notNull(),
    oidc_client_id: integer().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    id: serial().primaryKey().notNull(),
    organization_id: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "users_oidc_clients_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.oidc_client_id],
      foreignColumns: [oidc_clients.id],
      name: "users_oidc_clients_oidc_client_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.organization_id],
      foreignColumns: [organizations.id],
      name: "users_oidc_clients_organization_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const organizations = pgTable(
  "organizations",
  {
    id: serial().primaryKey().notNull(),
    siret: varchar().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default("1970-01-01 00:00:00")
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default("1970-01-01 00:00:00")
      .notNull(),
    cached_libelle: varchar(),
    cached_nom_complet: varchar(),
    cached_enseigne: varchar(),
    cached_tranche_effectifs: varchar(),
    cached_tranche_effectifs_unite_legale: varchar(),
    cached_libelle_tranche_effectif: varchar(),
    cached_etat_administratif: varchar(),
    cached_est_active: boolean(),
    cached_statut_diffusion: varchar(),
    cached_est_diffusible: boolean(),
    cached_adresse: varchar(),
    cached_code_postal: varchar(),
    cached_activite_principale: varchar(),
    cached_libelle_activite_principale: varchar(),
    cached_categorie_juridique: varchar(),
    cached_libelle_categorie_juridique: varchar(),
    organization_info_fetched_at: timestamp({
      withTimezone: true,
      mode: "string",
    }),
    cached_code_officiel_geographique: varchar(),
  },
  (table) => [
    uniqueIndex("index_organizations_on_siret").using(
      "btree",
      table.siret.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const authenticators = pgTable(
  "authenticators",
  {
    credential_id: text().primaryKey().notNull(),
    // TODO: failed to parse database type 'bytea'
    credential_public_key: bytea("credential_public_key").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    counter: bigint({ mode: "number" }).notNull(),
    credential_device_type: varchar({ length: 32 }),
    credential_backed_up: boolean().notNull(),
    transports: varchar({ length: 255 }).array().default([""]),
    user_id: integer().notNull(),
    display_name: varchar(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    last_used_at: timestamp({ withTimezone: true, mode: "string" }),
    usage_count: integer().default(0).notNull(),
    user_verified: boolean().default(true).notNull(),
  },
  (table) => [
    uniqueIndex("index_authenticators_on_credential_id").using(
      "btree",
      table.credential_id.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "authenticators_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    email: varchar().notNull(),
    encrypted_password: varchar(),
    reset_password_token: varchar(),
    reset_password_sent_at: timestamp({ withTimezone: true, mode: "string" }),
    sign_in_count: integer().default(0).notNull(),
    last_sign_in_at: timestamp({ withTimezone: true, mode: "string" }),
    created_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    email_verified: boolean().default(false).notNull(),
    verify_email_token: varchar(),
    verify_email_sent_at: timestamp({ withTimezone: true, mode: "string" }),
    given_name: varchar(),
    family_name: varchar(),
    phone_number: varchar(),
    job: varchar(),
    magic_link_token: varchar(),
    magic_link_sent_at: timestamp({ withTimezone: true, mode: "string" }),
    email_verified_at: timestamp({ withTimezone: true, mode: "string" }),
    current_challenge: varchar(),
    needs_inclusionconnect_welcome_page: boolean().default(false).notNull(),
    needs_inclusionconnect_onboarding_help: boolean().default(false).notNull(),
    encrypted_totp_key: varchar(),
    totp_key_verified_at: timestamp({ withTimezone: true, mode: "string" }),
    force_2fa: boolean().default(false).notNull(),
  },
  (table) => [
    uniqueIndex("index_users_on_email").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("index_users_on_reset_password_token").using(
      "btree",
      table.reset_password_token.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const email_domains = pgTable(
  "email_domains",
  {
    id: serial().primaryKey().notNull(),
    organization_id: integer().notNull(),
    domain: varchar({ length: 255 }).notNull(),
    verification_type: varchar({ length: 255 }),
    can_be_suggested: boolean().default(true).notNull(),
    verified_at: timestamp({ withTimezone: true, mode: "string" }),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organization_id],
      foreignColumns: [organizations.id],
      name: "email_domains_organization_id_fkey",
    }).onDelete("cascade"),
    unique("unique_organization_domain").on(
      table.organization_id,
      table.domain,
      table.verification_type,
    ),
  ],
);

export const moderations = pgTable(
  "moderations",
  {
    id: serial().primaryKey().notNull(),
    user_id: integer().notNull(),
    organization_id: integer().notNull(),
    type: varchar().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    moderated_at: timestamp({ withTimezone: true, mode: "string" }),
    comment: varchar(),
    moderated_by: varchar(),
    ticket_id: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "moderations_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.organization_id],
      foreignColumns: [organizations.id],
      name: "moderations_organization_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const oidc_clients = pgTable("oidc_clients", {
  id: serial().primaryKey().notNull(),
  client_name: varchar().notNull(),
  client_id: varchar().notNull(),
  client_secret: varchar().notNull(),
  redirect_uris: varchar().array().default([""]).notNull(),
  created_at: timestamp({ withTimezone: true, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: timestamp({ withTimezone: true, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  post_logout_redirect_uris: varchar().array().default([""]).notNull(),
  scope: varchar().default("openid email").notNull(),
  client_uri: varchar(),
  client_description: varchar(),
  userinfo_signed_response_alg: varchar(),
  id_token_signed_response_alg: varchar(),
  authorization_signed_response_alg: varchar(),
  introspection_signed_response_alg: varchar(),
  is_proconnect_federation: boolean().default(false).notNull(),
});

export const franceconnect_userinfo = pgTable(
  "franceconnect_userinfo",
  {
    user_id: integer().primaryKey().notNull(),
    birthdate: timestamp({ withTimezone: true, mode: "string" }),
    birthplace: varchar({ length: 255 }),
    family_name: varchar({ length: 255 }),
    gender: varchar({ length: 255 }),
    given_name: varchar({ length: 255 }),
    preferred_username: varchar({ length: 255 }),
    sub: varchar({ length: 255 }),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "franceconnect_userinfo_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const users_organizations = pgTable(
  "users_organizations",
  {
    user_id: integer().notNull(),
    organization_id: integer().notNull(),
    is_external: boolean().default(false).notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default("1970-01-01 00:00:00")
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default("1970-01-01 00:00:00")
      .notNull(),
    verification_type: varchar(),
    has_been_greeted: boolean().default(false).notNull(),
    needs_official_contact_email_verification: boolean()
      .default(false)
      .notNull(),
    official_contact_email_verification_token: varchar(),
    official_contact_email_verification_sent_at: timestamp({
      withTimezone: true,
      mode: "string",
    }),
    verified_at: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "users_organizations_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.organization_id],
      foreignColumns: [organizations.id],
      name: "users_organizations_organization_id_fkey",
    }).onUpdate("cascade"),
    primaryKey({
      columns: [table.user_id, table.organization_id],
      name: "users_organizations_pkey",
    }),
  ],
);

import { bytea } from "./orm/columes/bytea.js";
