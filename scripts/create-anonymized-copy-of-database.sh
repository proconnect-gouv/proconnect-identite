#!/bin/sh

set -e

logPrefix(){
  echo "$(date --iso-8601=seconds) -"
}

if [ -n "$(which dbclient-fetcher)" ]; then
  dbclient-fetcher pgsql 16
fi

export SRC_DB_URL=$SCALINGO_POSTGRESQL_URL
export DEST_DB_URL=$METABASE_DB_URL

if [ "$APP" != "proconnect-identite" ]; then exit 0; fi

echo "$(logPrefix) Creating anonymized copy of database $SRC_DB_URL in $DEST_DB_URL..."

echo "$(logPrefix) Cleaning anonymized database in correct order..."
psql $DEST_DB_URL --command="DROP TABLE IF EXISTS users_organizations"
psql $DEST_DB_URL --command="DROP TABLE IF EXISTS users_oidc_clients"
psql $DEST_DB_URL --command="DROP TABLE IF EXISTS moderations"
psql $DEST_DB_URL --command="DROP TABLE IF EXISTS email_domains"
psql $DEST_DB_URL --command="DROP TABLE IF EXISTS organizations"
psql $DEST_DB_URL --command="DROP TABLE IF EXISTS users"
psql $DEST_DB_URL --command="DROP TABLE IF EXISTS oidc_clients"

echo "$(logPrefix) Creating anonymized copy of table users..."
psql $SRC_DB_URL -c "
CREATE TABLE tmp_users AS
SELECT
  id,
  'anonymous@' || substring(email from '@(.*)$') as email,
  '**********' as encrypted_password,
  '**********' as reset_password_token,
  reset_password_sent_at,
  sign_in_count,
  last_sign_in_at,
  created_at,
  updated_at,
  email_verified,
  '**********' as verify_email_token,
  verify_email_sent_at,
  'anonymous' as given_name,
  'anonymous' as family_name,
  '**********' as phone_number,
  job,
  '**********' as magic_link_token,
  magic_link_sent_at,
  email_verified_at,
  '**********' as current_challenge,
  needs_inclusionconnect_welcome_page,
  needs_inclusionconnect_onboarding_help,
  '**********' as encrypted_totp_key,
  totp_key_verified_at,
  force_2fa
FROM users"
psql $SRC_DB_URL --command="ALTER TABLE tmp_users ADD PRIMARY KEY (id)"
pg_dump --table=tmp_users $SRC_DB_URL | psql $DEST_DB_URL
psql $DEST_DB_URL --command="ALTER TABLE tmp_users RENAME TO users"
psql $SRC_DB_URL --command="DROP TABLE IF EXISTS tmp_users"

echo "$(logPrefix) Creating anonymized copy of table organizations..."
psql $SRC_DB_URL -c "
CREATE TABLE tmp_organizations AS
SELECT
  id,
  siret,
  created_at,
  updated_at,
  cached_libelle,
  cached_nom_complet,
  cached_enseigne,
  cached_tranche_effectifs,
  cached_tranche_effectifs_unite_legale,
  cached_libelle_tranche_effectif,
  cached_etat_administratif,
  cached_est_active,
  cached_statut_diffusion,
  cached_est_diffusible,
  cached_adresse,
  cached_code_postal,
  cached_activite_principale,
  cached_libelle_activite_principale,
  cached_categorie_juridique,
  cached_libelle_categorie_juridique,
  organization_info_fetched_at,
  cached_code_officiel_geographique
FROM organizations"
psql $SRC_DB_URL --command="ALTER TABLE tmp_organizations ADD PRIMARY KEY (id)"
pg_dump --table=tmp_organizations $SRC_DB_URL | psql $DEST_DB_URL
psql $DEST_DB_URL --command="ALTER TABLE tmp_organizations RENAME TO organizations"
psql $SRC_DB_URL --command="DROP TABLE IF EXISTS tmp_organizations"

echo "$(logPrefix) Creating anonymized copy of table email_domains..."
psql $SRC_DB_URL -c "
CREATE TABLE tmp_email_domains AS
SELECT
	id,
	organization_id,
	domain,
	verification_type,
	can_be_suggested,
	verified_at,
	created_at,
	updated_at
FROM email_domains"
psql $SRC_DB_URL --command="ALTER TABLE tmp_email_domains ADD PRIMARY KEY (id)"
pg_dump --table=tmp_email_domains $SRC_DB_URL | psql $DEST_DB_URL
psql $DEST_DB_URL --command="ALTER TABLE tmp_email_domains RENAME TO email_domains"
psql $SRC_DB_URL --command="DROP TABLE IF EXISTS tmp_email_domains"

echo "$(logPrefix) Creating anonymized copy of table moderations..."
psql $SRC_DB_URL -c "
CREATE TABLE tmp_moderations AS
SELECT
	id,
	user_id,
	organization_id,
	type,
	created_at,
	moderated_at,
	comment,
	LEFT(NULLIF(moderated_by, ''), 4) || '******' as moderated_by,
	'**********' as ticket_id
FROM moderations"
psql $SRC_DB_URL --command="ALTER TABLE tmp_moderations ADD PRIMARY KEY (id)"
pg_dump --table=tmp_moderations $SRC_DB_URL | psql $DEST_DB_URL
psql $DEST_DB_URL --command="ALTER TABLE tmp_moderations RENAME TO moderations"
psql $SRC_DB_URL --command="DROP TABLE IF EXISTS tmp_moderations"

echo "$(logPrefix) Creating anonymized copy of table oidc_clients..."
psql $SRC_DB_URL -c "
CREATE TABLE tmp_oidc_clients AS
SELECT
  id,
  client_name,
  '**********' as client_id,
  '**********' as client_secret,
  redirect_uris,
  created_at,
  updated_at,
  post_logout_redirect_uris,
  scope,
  client_uri,
  client_description,
  userinfo_signed_response_alg,
  id_token_signed_response_alg,
  authorization_signed_response_alg,
  introspection_signed_response_alg,
  is_proconnect_federation
FROM oidc_clients"
psql $SRC_DB_URL --command="ALTER TABLE tmp_oidc_clients ADD PRIMARY KEY (id)"
pg_dump --table=tmp_oidc_clients $SRC_DB_URL | psql $DEST_DB_URL
psql $DEST_DB_URL --command="ALTER TABLE tmp_oidc_clients RENAME TO oidc_clients"
psql $SRC_DB_URL --command="DROP TABLE IF EXISTS tmp_oidc_clients"

echo "$(logPrefix) Creating anonymized copy of table users_oidc_clients..."
psql $SRC_DB_URL -c "
CREATE TABLE tmp_users_oidc_clients AS
SELECT
	user_id,
	oidc_client_id,
	created_at,
	updated_at,
	id,
	organization_id
FROM users_oidc_clients"
psql $SRC_DB_URL --command="ALTER TABLE tmp_users_oidc_clients ADD PRIMARY KEY (id)"
pg_dump --table=tmp_users_oidc_clients $SRC_DB_URL | psql $DEST_DB_URL
psql $DEST_DB_URL --command="ALTER TABLE tmp_users_oidc_clients RENAME TO users_oidc_clients"
psql $SRC_DB_URL --command="DROP TABLE IF EXISTS tmp_users_oidc_clients"

echo "$(logPrefix) Creating anonymized copy of table users_organizations..."
psql $SRC_DB_URL -c "
CREATE TABLE tmp_users_organizations AS
SELECT
	user_id,
	organization_id,
	is_external,
	created_at,
	updated_at,
	verification_type,
	has_been_greeted,
	needs_official_contact_email_verification,
	'**********' as official_contact_email_verification_token,
	official_contact_email_verification_sent_at,
	verified_at
FROM users_organizations"
psql $SRC_DB_URL --command="ALTER TABLE tmp_users_organizations ADD PRIMARY KEY("user_id","organization_id")"
pg_dump --table=tmp_users_organizations $SRC_DB_URL | psql $DEST_DB_URL
psql $DEST_DB_URL --command="ALTER TABLE tmp_users_organizations RENAME TO users_organizations"
psql $SRC_DB_URL --command="DROP TABLE IF EXISTS tmp_users_organizations"

echo "$(logPrefix) Restoring access to user metabase..."
psql $DEST_DB_URL --command="GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase"

echo "$(logPrefix) Anonymized copy of $SRC_DB_URL successfully created in $DEST_DB_URL!"
