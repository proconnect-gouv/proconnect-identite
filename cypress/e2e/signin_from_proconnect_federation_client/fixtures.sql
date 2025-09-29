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
    'unused1@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Jack',
    '0123456789',
    'Sbire'
  ),
  (
    2,
    'unused2@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Luck',
    '',
    'Sbire'
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
    verification_type,
    has_been_greeted
  )
VALUES
  (1, 1, false, 'domain', true),
  (2, 1, false, 'domain', true);

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
    introspection_signed_response_alg,
    is_proconnect_federation
  )
VALUES
  (
    'ProConnect Federation',
    'proconnect_federation_client_id',
    'proconnect_federation_client_secret',
    ARRAY['http://localhost:4001/login-callback'],
    ARRAY[]::varchar[],
    'openid uid given_name usual_name email phone siret is_service_public is_public_service',
    'http://localhost:4001/',
    'Dispositif d’identification des agents de la fonction publique.',
    'ES256',
    'ES256',
    'ES256',
    'ES256',
    true
  );
