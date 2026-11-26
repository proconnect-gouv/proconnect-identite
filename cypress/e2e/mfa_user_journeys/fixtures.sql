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
    job,
    encrypted_totp_key,
    totp_key_verified_at,
    force_2fa
  )
VALUES
  (
    1,
    'pas-de-2e-facteur@example.org',
    true,
    CURRENT_TIMESTAMP,
    -- password: "password123"
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Inès',
    'Haddad',
    '0123456789',
    'Chargée de mission',
    NULL,
    NULL,
    false
  ),
  (
    2,
    'avec-totp-et-mots-de-secours@example.org',
    true,
    CURRENT_TIMESTAMP,
    -- password: "password123"
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Antoine',
    'Mercier',
    '0123456789',
    'Chargé de mission',
    -- TOTP secret key: "DIN5NCVBLUQPX7XFZQCYBMIBMTJOCNSF"
    'kuOSXGk68H2B3pYnph0uyXAHrmpbWaWyX/iX49xVaUc=.VMPBZSO+eAng7mjS.cI2kRY9rwhXchcKiiaMZIg==',
    CURRENT_TIMESTAMP,
    true
  );

INSERT INTO
  organizations (id, siret, created_at, updated_at)
VALUES
  (
    1,
    '21340126800130',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  users_organizations (
    user_id,
    organization_id,
    is_external,
    verification_type
  )
VALUES
  (1, 1, false, 'domain'),
  (2, 1, false, 'domain');

INSERT INTO
  recovery_words (user_id, hashed_words)
VALUES
  (
    2,
    -- recovery words: "balade comptoir lasagne verrou aimable totem"
    '$2b$10$R8IJz.PmB/2e1hM6BYHHru4VJPTmDaXM/CpvfPKaP/jhhW9v72YZm'
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
    'Service de démonstration',
    'client_id',
    'client_secret',
    ARRAY['http://localhost:3001/login-callback'],
    ARRAY['http://localhost:3001/'],
    'openid email profile organization',
    'http://localhost:3001/',
    'ProConnect test client. More info: https://github.com/proconnect-gouv/proconnect-test-client.',
    null,
    null,
    null,
    null
  );
