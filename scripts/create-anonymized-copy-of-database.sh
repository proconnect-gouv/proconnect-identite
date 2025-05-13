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
  regexp_replace(encrypted_password, '.', '*', 'g') as encrypted_password,
  regexp_replace(reset_password_token, '.', '*', 'g') as reset_password_token,
  reset_password_sent_at,
  sign_in_count,
  last_sign_in_at,
  created_at,
  updated_at,
  email_verified,
  regexp_replace(verify_email_token, '.', '*', 'g') as verify_email_token,
  verify_email_sent_at,
  'anonymous' as given_name,
  'anonymous' as family_name,
  regexp_replace(phone_number, '.', '*', 'g') as phone_number,
  job,
  regexp_replace(magic_link_token, '.', '*', 'g') as magic_link_token,
  magic_link_sent_at,
  email_verified_at,
  regexp_replace(current_challenge, '.', '*', 'g') as current_challenge,
  needs_inclusionconnect_welcome_page,
  needs_inclusionconnect_onboarding_help,
  regexp_replace(encrypted_totp_key, '.', '*', 'g') as encrypted_totp_key,
  totp_key_verified_at,
  force_2fa
FROM users"
psql $SRC_DB_URL --command="ALTER TABLE tmp_users ADD PRIMARY KEY (id)"
pg_dump --table=tmp_users $SRC_DB_URL | psql $DEST_DB_URL
psql $DEST_DB_URL --command="ALTER TABLE tmp_users RENAME TO users"
psql $SRC_DB_URL --command="DROP TABLE IF EXISTS tmp_users"

echo "$(logPrefix) Creating anonymized copy of table organizations..."
pg_dump --table=organizations $SRC_DB_URL | psql $DEST_DB_URL

echo "$(logPrefix) Creating anonymized copy of table email_domains..."
pg_dump --table=email_domains $SRC_DB_URL | psql $DEST_DB_URL

echo "$(logPrefix) Creating anonymized copy of table moderations..."
pg_dump --table=moderations $SRC_DB_URL | psql $DEST_DB_URL

echo "$(logPrefix) Creating anonymized copy of table oidc_clients..."
psql $SRC_DB_URL -c "
CREATE TABLE tmp_oidc_clients AS
SELECT
  id,
  client_name,
  regexp_replace(client_id, '.', '*', 'g') as client_id,
  regexp_replace(client_secret, '.', '*', 'g') as client_secret,
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
pg_dump --table=users_oidc_clients $SRC_DB_URL | psql $DEST_DB_URL

echo "$(logPrefix) Creating anonymized copy of table users_organizations..."
pg_dump --table=users_organizations $SRC_DB_URL | psql $DEST_DB_URL

echo "$(logPrefix) Restoring access to user metabase..."
psql $DEST_DB_URL --command="GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase"

echo "$(logPrefix) Anonymized copy of $SRC_DB_URL successfully created in $DEST_DB_URL!"
