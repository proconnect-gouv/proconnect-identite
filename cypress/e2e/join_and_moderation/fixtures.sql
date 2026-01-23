INSERT INTO
  users (
    id,
    email,
    email_verified,
    email_verified_at,
    encrypted_password,
    created_at,
    updated_at,
    given_name,
    family_name,
    phone_number,
    job
  )
VALUES
  (
    1,
    'lion.eljonson@darkangels.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Nouveau',
    '0123456789',
    'Sbire'
  ),
  (
    2,
    'leman.russ@spacewolves.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Nouveau',
    '0123456789',
    'Sbire'
  ),
  (
    3,
    'moderation-ongoing-and-no-userinfo+konrad.curze@nightlords.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    null,
    null,
    null,
    'Primarque'
  );

INSERT INTO
  organizations (id, cached_libelle, siret, created_at, updated_at)
VALUES
  (
    1,
    'BNP PARIBAS',
    '66204244933106',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    2,
    'BNP PARIBAS (HELLO BANK!)',
    '66204244914742',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  moderations (
    id,
    user_id,
    organization_id,
    type,
    created_at,
    moderated_at,
    comment,
    moderated_by,
    ticket_id
  )
VALUES
  (
    1,
    3,
    1,
    'organization_join_block',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    NULL,
    NULL,
    NULL,
    NULL
  );

INSERT INTO
  oidc_clients (
    client_name,
    client_id,
    client_secret,
    redirect_uris,
    post_logout_redirect_uris,
    scope,
    client_uri,
    client_description,
    userinfo_signed_response_alg,
    id_token_signed_response_alg,
    authorization_signed_response_alg,
    introspection_signed_response_alg
  )
VALUES
  (
    'Oidc Test Client',
    'standard_client_id',
    'standard_client_secret',
    ARRAY['http://localhost:4000/login-callback'],
    ARRAY['http://localhost:4000/'],
    'openid email profile organization',
    'http://localhost:4000/',
    'ProConnect test client. More info: https://github.com/proconnect-gouv/proconnect-test-client.',
    null,
    null,
    null,
    null
  );
