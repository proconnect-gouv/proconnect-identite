--
-- PostgreSQL database dump
--
-- Dumped from database version 16.9 (Debian 16.9-1.pgdg130+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg130+1)
SET
  statement_timeout = 0;

SET
  lock_timeout = 0;

SET
  idle_in_transaction_session_timeout = 0;

SET
  client_encoding = 'UTF8';

SET
  standard_conforming_strings = on;

SELECT
  pg_catalog.set_config ('search_path', '', false);

SET
  check_function_bodies = false;

SET
  xmloption = content;

SET
  client_min_messages = warning;

SET
  row_security = off;

ALTER TABLE IF EXISTS ONLY "public"."users_organizations"
DROP CONSTRAINT IF EXISTS "users_organizations_user_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."users_organizations"
DROP CONSTRAINT IF EXISTS "users_organizations_organization_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."users_oidc_clients"
DROP CONSTRAINT IF EXISTS "users_oidc_clients_user_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."users_oidc_clients"
DROP CONSTRAINT IF EXISTS "users_oidc_clients_organization_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."users_oidc_clients"
DROP CONSTRAINT IF EXISTS "users_oidc_clients_oidc_client_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."moderations"
DROP CONSTRAINT IF EXISTS "moderations_user_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."moderations"
DROP CONSTRAINT IF EXISTS "moderations_organization_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."franceconnect_userinfo"
DROP CONSTRAINT IF EXISTS "franceconnect_userinfo_user_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."email_domains"
DROP CONSTRAINT IF EXISTS "email_domains_organization_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."authenticators"
DROP CONSTRAINT IF EXISTS "authenticators_user_id_fkey";

ALTER TABLE IF EXISTS ONLY "public"."audit_logs"
DROP CONSTRAINT IF EXISTS "audit_logs_user_id_fkey";

DROP TRIGGER IF EXISTS "audit_users_organizations" ON "public"."users_organizations";

DROP TRIGGER IF EXISTS "audit_users" ON "public"."users";

DROP TRIGGER IF EXISTS "audit_organizations" ON "public"."organizations";

DROP INDEX IF EXISTS "public"."index_users_on_reset_password_token";

DROP INDEX IF EXISTS "public"."index_users_on_email";

DROP INDEX IF EXISTS "public"."index_organizations_on_siret";

DROP INDEX IF EXISTS "public"."index_authenticators_on_credential_id";

DROP INDEX IF EXISTS "public"."idx_audit_logs_user_id";

DROP INDEX IF EXISTS "public"."idx_audit_logs_table_record";

DROP INDEX IF EXISTS "public"."idx_audit_logs_migration";

DROP INDEX IF EXISTS "public"."idx_audit_logs_created_at";

ALTER TABLE IF EXISTS ONLY "public"."users"
DROP CONSTRAINT IF EXISTS "users_pkey";

ALTER TABLE IF EXISTS ONLY "public"."users_organizations"
DROP CONSTRAINT IF EXISTS "users_organizations_pkey";

ALTER TABLE IF EXISTS ONLY "public"."users_oidc_clients"
DROP CONSTRAINT IF EXISTS "users_oidc_clients_pkey";

ALTER TABLE IF EXISTS ONLY "public"."email_domains"
DROP CONSTRAINT IF EXISTS "unique_organization_domain";

ALTER TABLE IF EXISTS ONLY "public"."organizations"
DROP CONSTRAINT IF EXISTS "organizations_pkey";

ALTER TABLE IF EXISTS ONLY "public"."oidc_clients"
DROP CONSTRAINT IF EXISTS "oidc_clients_pkey";

ALTER TABLE IF EXISTS ONLY "public"."moderations"
DROP CONSTRAINT IF EXISTS "moderations_pkey";

ALTER TABLE IF EXISTS ONLY "public"."franceconnect_userinfo"
DROP CONSTRAINT IF EXISTS "franceconnect_userinfo_pkey";

ALTER TABLE IF EXISTS ONLY "public"."email_domains"
DROP CONSTRAINT IF EXISTS "email_domains_pkey";

ALTER TABLE IF EXISTS ONLY "public"."email_deliverability_whitelist"
DROP CONSTRAINT IF EXISTS "email_deliverability_whitelist_pkey";

ALTER TABLE IF EXISTS ONLY "public"."authenticators"
DROP CONSTRAINT IF EXISTS "authenticators_pkey";

ALTER TABLE IF EXISTS ONLY "public"."audit_logs"
DROP CONSTRAINT IF EXISTS "audit_logs_pkey";

ALTER TABLE IF EXISTS "public"."users_oidc_clients"
ALTER COLUMN "id"
DROP DEFAULT;

ALTER TABLE IF EXISTS "public"."users"
ALTER COLUMN "id"
DROP DEFAULT;

ALTER TABLE IF EXISTS "public"."organizations"
ALTER COLUMN "id"
DROP DEFAULT;

ALTER TABLE IF EXISTS "public"."oidc_clients"
ALTER COLUMN "id"
DROP DEFAULT;

ALTER TABLE IF EXISTS "public"."moderations"
ALTER COLUMN "id"
DROP DEFAULT;

ALTER TABLE IF EXISTS "public"."email_domains"
ALTER COLUMN "id"
DROP DEFAULT;

ALTER TABLE IF EXISTS "public"."audit_logs"
ALTER COLUMN "id"
DROP DEFAULT;

DROP TABLE IF EXISTS "public"."users_organizations";

DROP SEQUENCE IF EXISTS "public"."users_oidc_clients_id_seq";

DROP TABLE IF EXISTS "public"."users_oidc_clients";

DROP SEQUENCE IF EXISTS "public"."users_id_seq";

DROP TABLE IF EXISTS "public"."users";

DROP SEQUENCE IF EXISTS "public"."organizations_id_seq";

DROP TABLE IF EXISTS "public"."organizations";

DROP SEQUENCE IF EXISTS "public"."oidc_clients_id_seq";

DROP TABLE IF EXISTS "public"."oidc_clients";

DROP SEQUENCE IF EXISTS "public"."moderations_id_seq";

DROP TABLE IF EXISTS "public"."moderations";

DROP TABLE IF EXISTS "public"."franceconnect_userinfo";

DROP SEQUENCE IF EXISTS "public"."email_domains_id_seq";

DROP TABLE IF EXISTS "public"."email_domains";

DROP TABLE IF EXISTS "public"."email_deliverability_whitelist";

DROP TABLE IF EXISTS "public"."authenticators";

DROP SEQUENCE IF EXISTS "public"."audit_logs_id_seq";

DROP TABLE IF EXISTS "public"."audit_logs";

DROP FUNCTION IF EXISTS "public"."audit_trigger_func" ();

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--
COMMENT ON SCHEMA "public" IS 'standard public schema';

--
-- Name: audit_trigger_func(); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION "public"."audit_trigger_func" () RETURNS "trigger" LANGUAGE "plpgsql" AS $$
    DECLARE
      v_old_values JSONB;
      v_new_values JSONB;
      v_changed_fields TEXT[];
      v_record_id INTEGER;
      v_user_id INTEGER;
      v_actor_email VARCHAR(255);
      v_actor_type VARCHAR(50);
      v_migration_name VARCHAR(100);
      v_key TEXT;
    BEGIN
      -- Get context from session variables (set by application or migrations)
      v_user_id := NULLIF(current_setting('app.actor_user_id', true), '')::INTEGER;
      v_actor_email := NULLIF(current_setting('app.actor_email', true), '');
      v_actor_type := COALESCE(NULLIF(current_setting('app.actor_type', true), ''), 'system');
      v_migration_name := NULLIF(current_setting('app.current_migration', true), '');

      -- Determine record_id (handle composite keys for users_organizations)
      IF TG_TABLE_NAME = 'users_organizations' THEN
        v_record_id := COALESCE(NEW.user_id, OLD.user_id);
      ELSE
        v_record_id := COALESCE(NEW.id, OLD.id);
      END IF;

      -- Set old/new values based on operation
      IF TG_OP = 'INSERT' THEN
        v_old_values := NULL;
        v_new_values := to_jsonb(NEW);
        v_changed_fields := NULL;
      ELSIF TG_OP = 'UPDATE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        -- Compute changed fields
        SELECT ARRAY_AGG(key)
        INTO v_changed_fields
        FROM jsonb_each(v_new_values) AS n(key, value)
        WHERE v_old_values->key IS DISTINCT FROM n.value;
      ELSIF TG_OP = 'DELETE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := NULL;
        v_changed_fields := NULL;
      END IF;

      -- Insert audit log entry
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_fields,
        user_id,
        actor_email,
        actor_type,
        migration_name
      ) VALUES (
        TG_TABLE_NAME,
        v_record_id,
        TG_OP,
        v_old_values,
        v_new_values,
        v_changed_fields,
        v_user_id,
        v_actor_email,
        v_actor_type,
        v_migration_name
      );

      RETURN COALESCE(NEW, OLD);
    END;
    $$;

SET
  default_tablespace = '';

SET
  default_table_access_method = "heap";

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."audit_logs" (
  "id" integer NOT NULL,
  "table_name" character varying(100) NOT NULL,
  "record_id" integer NOT NULL,
  "action" character varying(20) NOT NULL,
  "old_values" "jsonb",
  "new_values" "jsonb",
  "changed_fields" "text" [],
  "user_id" integer,
  "actor_email" character varying(255),
  "actor_type" character varying(50) DEFAULT '''system'''::character varying,
  "migration_name" character varying(100),
  "created_at" timestamp with time zone DEFAULT "now" () NOT NULL
);

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE "public"."audit_logs_id_seq" AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE "public"."audit_logs_id_seq" OWNED BY "public"."audit_logs"."id";

--
-- Name: authenticators; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."authenticators" (
  "credential_id" "text" NOT NULL,
  "credential_public_key" "bytea" NOT NULL,
  "counter" bigint NOT NULL,
  "credential_device_type" character varying(32),
  "credential_backed_up" boolean NOT NULL,
  "transports" character varying(255) [] DEFAULT '{}'::character varying[],
  "user_id" integer NOT NULL,
  "display_name" character varying,
  "created_at" timestamp with time zone DEFAULT "now" () NOT NULL,
  "last_used_at" timestamp with time zone,
  "usage_count" integer DEFAULT 0 NOT NULL,
  "user_verified" boolean DEFAULT true NOT NULL
);

--
-- Name: email_deliverability_whitelist; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."email_deliverability_whitelist" (
  "problematic_email" character varying NOT NULL,
  "email_domain" character varying NOT NULL,
  "verified_at" timestamp with time zone DEFAULT "now" () NOT NULL,
  "verified_by" character varying
);

--
-- Name: email_domains; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."email_domains" (
  "id" integer NOT NULL,
  "organization_id" integer NOT NULL,
  "domain" character varying(255) NOT NULL,
  "verification_type" character varying(255),
  "can_be_suggested" boolean DEFAULT true NOT NULL,
  "verified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: email_domains_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE "public"."email_domains_id_seq" AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--
-- Name: email_domains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE "public"."email_domains_id_seq" OWNED BY "public"."email_domains"."id";

--
-- Name: franceconnect_userinfo; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."franceconnect_userinfo" (
  "user_id" integer NOT NULL,
  "birthdate" timestamp with time zone,
  "birthplace" character varying(255),
  "family_name" character varying(255),
  "gender" character varying(255),
  "given_name" character varying(255),
  "preferred_username" character varying(255),
  "sub" character varying(255),
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "birthcountry" character varying(255)
);

--
-- Name: moderations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."moderations" (
  "id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "organization_id" integer NOT NULL,
  "type" character varying NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now" () NOT NULL,
  "moderated_at" timestamp with time zone,
  "comment" character varying,
  "moderated_by" character varying,
  "ticket_id" "text",
  "status" "text" DEFAULT 'unknown'::"text" NOT NULL
);

--
-- Name: moderations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE "public"."moderations_id_seq" AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--
-- Name: moderations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE "public"."moderations_id_seq" OWNED BY "public"."moderations"."id";

--
-- Name: oidc_clients; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."oidc_clients" (
  "id" integer NOT NULL,
  "client_name" character varying NOT NULL,
  "client_id" character varying NOT NULL,
  "client_secret" character varying NOT NULL,
  "redirect_uris" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "post_logout_redirect_uris" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
  "scope" character varying DEFAULT 'openid email'::character varying NOT NULL,
  "client_uri" character varying,
  "client_description" character varying,
  "userinfo_signed_response_alg" character varying,
  "id_token_signed_response_alg" character varying,
  "authorization_signed_response_alg" character varying,
  "introspection_signed_response_alg" character varying,
  "is_proconnect_federation" boolean DEFAULT false NOT NULL
);

--
-- Name: oidc_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE "public"."oidc_clients_id_seq" AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--
-- Name: oidc_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE "public"."oidc_clients_id_seq" OWNED BY "public"."oidc_clients"."id";

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."organizations" (
  "id" integer NOT NULL,
  "siret" character varying NOT NULL,
  "created_at" timestamp with time zone DEFAULT '1970-01-01 00:00:00'::timestamp without time zone NOT NULL,
  "updated_at" timestamp with time zone DEFAULT '1970-01-01 00:00:00'::timestamp without time zone NOT NULL,
  "cached_libelle" character varying,
  "cached_nom_complet" character varying,
  "cached_enseigne" character varying,
  "cached_tranche_effectifs" character varying,
  "cached_tranche_effectifs_unite_legale" character varying,
  "cached_libelle_tranche_effectif" character varying,
  "cached_etat_administratif" character varying,
  "cached_est_active" boolean,
  "cached_statut_diffusion" character varying,
  "cached_est_diffusible" boolean,
  "cached_adresse" character varying,
  "cached_code_postal" character varying,
  "cached_activite_principale" character varying,
  "cached_libelle_activite_principale" character varying,
  "cached_categorie_juridique" character varying,
  "cached_libelle_categorie_juridique" character varying,
  "organization_info_fetched_at" timestamp with time zone,
  "cached_code_officiel_geographique" character varying
);

--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE "public"."organizations_id_seq" AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE "public"."organizations_id_seq" OWNED BY "public"."organizations"."id";

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."users" (
  "id" integer NOT NULL,
  "email" character varying NOT NULL,
  "encrypted_password" character varying,
  "reset_password_token" character varying,
  "reset_password_sent_at" timestamp with time zone,
  "sign_in_count" integer DEFAULT 0 NOT NULL,
  "last_sign_in_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "email_verified" boolean DEFAULT false NOT NULL,
  "verify_email_token" character varying,
  "verify_email_sent_at" timestamp with time zone,
  "given_name" character varying,
  "family_name" character varying,
  "phone_number" character varying,
  "job" character varying,
  "magic_link_token" character varying,
  "magic_link_sent_at" timestamp with time zone,
  "email_verified_at" timestamp with time zone,
  "current_challenge" character varying,
  "needs_inclusionconnect_welcome_page" boolean DEFAULT false NOT NULL,
  "needs_inclusionconnect_onboarding_help" boolean DEFAULT false NOT NULL,
  "encrypted_totp_key" character varying,
  "totp_key_verified_at" timestamp with time zone,
  "force_2fa" boolean DEFAULT false NOT NULL
);

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE "public"."users_id_seq" AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";

--
-- Name: users_oidc_clients; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."users_oidc_clients" (
  "user_id" integer NOT NULL,
  "oidc_client_id" integer NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "id" integer NOT NULL,
  "organization_id" integer
);

--
-- Name: users_oidc_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE "public"."users_oidc_clients_id_seq" AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

--
-- Name: users_oidc_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE "public"."users_oidc_clients_id_seq" OWNED BY "public"."users_oidc_clients"."id";

--
-- Name: users_organizations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE "public"."users_organizations" (
  "user_id" integer NOT NULL,
  "organization_id" integer NOT NULL,
  "is_external" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT '1970-01-01 00:00:00'::timestamp without time zone NOT NULL,
  "updated_at" timestamp with time zone DEFAULT '1970-01-01 00:00:00'::timestamp without time zone NOT NULL,
  "verification_type" character varying,
  "has_been_greeted" boolean DEFAULT false NOT NULL,
  "needs_official_contact_email_verification" boolean DEFAULT false NOT NULL,
  "official_contact_email_verification_token" character varying,
  "official_contact_email_verification_sent_at" timestamp with time zone,
  "verified_at" timestamp with time zone
);

--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."audit_logs"
ALTER COLUMN "id"
SET DEFAULT "nextval" ('"public"."audit_logs_id_seq"'::"regclass");

--
-- Name: email_domains id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."email_domains"
ALTER COLUMN "id"
SET DEFAULT "nextval" ('"public"."email_domains_id_seq"'::"regclass");

--
-- Name: moderations id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."moderations"
ALTER COLUMN "id"
SET DEFAULT "nextval" ('"public"."moderations_id_seq"'::"regclass");

--
-- Name: oidc_clients id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."oidc_clients"
ALTER COLUMN "id"
SET DEFAULT "nextval" ('"public"."oidc_clients_id_seq"'::"regclass");

--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."organizations"
ALTER COLUMN "id"
SET DEFAULT "nextval" ('"public"."organizations_id_seq"'::"regclass");

--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users"
ALTER COLUMN "id"
SET DEFAULT "nextval" ('"public"."users_id_seq"'::"regclass");

--
-- Name: users_oidc_clients id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users_oidc_clients"
ALTER COLUMN "id"
SET DEFAULT "nextval" (
  '"public"."users_oidc_clients_id_seq"'::"regclass"
);

--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."audit_logs"
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

--
-- Name: authenticators authenticators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."authenticators"
ADD CONSTRAINT "authenticators_pkey" PRIMARY KEY ("credential_id");

--
-- Name: email_deliverability_whitelist email_deliverability_whitelist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."email_deliverability_whitelist"
ADD CONSTRAINT "email_deliverability_whitelist_pkey" PRIMARY KEY ("email_domain");

--
-- Name: email_domains email_domains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."email_domains"
ADD CONSTRAINT "email_domains_pkey" PRIMARY KEY ("id");

--
-- Name: franceconnect_userinfo franceconnect_userinfo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."franceconnect_userinfo"
ADD CONSTRAINT "franceconnect_userinfo_pkey" PRIMARY KEY ("user_id");

--
-- Name: moderations moderations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."moderations"
ADD CONSTRAINT "moderations_pkey" PRIMARY KEY ("id");

--
-- Name: oidc_clients oidc_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."oidc_clients"
ADD CONSTRAINT "oidc_clients_pkey" PRIMARY KEY ("id");

--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."organizations"
ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");

--
-- Name: email_domains unique_organization_domain; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."email_domains"
ADD CONSTRAINT "unique_organization_domain" UNIQUE NULLS NOT DISTINCT ("organization_id", "domain", "verification_type");

--
-- Name: users_oidc_clients users_oidc_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users_oidc_clients"
ADD CONSTRAINT "users_oidc_clients_pkey" PRIMARY KEY ("id");

--
-- Name: users_organizations users_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users_organizations"
ADD CONSTRAINT "users_organizations_pkey" PRIMARY KEY ("user_id", "organization_id");

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at");

--
-- Name: idx_audit_logs_migration; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "idx_audit_logs_migration" ON "public"."audit_logs" USING "btree" ("migration_name")
WHERE
  ("migration_name" IS NOT NULL);

--
-- Name: idx_audit_logs_table_record; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "idx_audit_logs_table_record" ON "public"."audit_logs" USING "btree" ("table_name", "record_id");

--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "idx_audit_logs_user_id" ON "public"."audit_logs" USING "btree" ("user_id")
WHERE
  ("user_id" IS NOT NULL);

--
-- Name: index_authenticators_on_credential_id; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX "index_authenticators_on_credential_id" ON "public"."authenticators" USING "btree" ("credential_id");

--
-- Name: index_organizations_on_siret; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX "index_organizations_on_siret" ON "public"."organizations" USING "btree" ("siret");

--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX "index_users_on_email" ON "public"."users" USING "btree" ("email");

--
-- Name: index_users_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX "index_users_on_reset_password_token" ON "public"."users" USING "btree" ("reset_password_token");

--
-- Name: organizations audit_organizations; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER "audit_organizations"
AFTER INSERT
OR DELETE
OR
UPDATE ON "public"."organizations" FOR EACH ROW
EXECUTE FUNCTION "public"."audit_trigger_func" ();

--
-- Name: users audit_users; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER "audit_users"
AFTER INSERT
OR DELETE
OR
UPDATE ON "public"."users" FOR EACH ROW
EXECUTE FUNCTION "public"."audit_trigger_func" ();

--
-- Name: users_organizations audit_users_organizations; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER "audit_users_organizations"
AFTER INSERT
OR DELETE
OR
UPDATE ON "public"."users_organizations" FOR EACH ROW
EXECUTE FUNCTION "public"."audit_trigger_func" ();

--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."audit_logs"
ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE SET NULL;

--
-- Name: authenticators authenticators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."authenticators"
ADD CONSTRAINT "authenticators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE;

--
-- Name: email_domains email_domains_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."email_domains"
ADD CONSTRAINT "email_domains_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("id") ON DELETE CASCADE;

--
-- Name: franceconnect_userinfo franceconnect_userinfo_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."franceconnect_userinfo"
ADD CONSTRAINT "franceconnect_userinfo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE;

--
-- Name: moderations moderations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."moderations"
ADD CONSTRAINT "moderations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("id") ON DELETE CASCADE;

--
-- Name: moderations moderations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."moderations"
ADD CONSTRAINT "moderations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE;

--
-- Name: users_oidc_clients users_oidc_clients_oidc_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users_oidc_clients"
ADD CONSTRAINT "users_oidc_clients_oidc_client_id_fkey" FOREIGN KEY ("oidc_client_id") REFERENCES "public"."oidc_clients" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: users_oidc_clients users_oidc_clients_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users_oidc_clients"
ADD CONSTRAINT "users_oidc_clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: users_oidc_clients users_oidc_clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users_oidc_clients"
ADD CONSTRAINT "users_oidc_clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: users_organizations users_organizations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users_organizations"
ADD CONSTRAINT "users_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE CASCADE;

--
-- Name: users_organizations users_organizations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY "public"."users_organizations"
ADD CONSTRAINT "users_organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

--
-- PostgreSQL database dump complete
--
