INSERT INTO
  organizations (id, siret, created_at, updated_at)
VALUES
  (
    1,
    '11009001600053',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    2,
    '21340126800130',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    3,
    '66204244933106',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
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
  ),
  (
    'Oidc Test Client',
    'standard_client_id',
    'standard_client_secret',
    ARRAY['http://localhost:4000/login-callback'],
    ARRAY[]::varchar[],
    'openid email profile organization',
    'http://localhost:4000/',
    'ProConnect test client. More info: https://github.com/proconnect-gouv/proconnect-test-client.',
    null,
    null,
    null,
    null,
    false
  );

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
    force_2fa
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
    'Lion',
    'El''Jonson',
    'I',
    'Primarque',
    false
  ),
  (
    2,
    'konrad.curze@nightlords.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Konrad',
    'Curze',
    'I',
    'Primarque',
    false
  ),
  (
    3,
    'rogal.dorn@imperialfists.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Rogal',
    'Dorn',
    'I',
    'Primarque',
    false
  ),
  (
    4,
    'jane.doe@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jane',
    'Doe',
    'La',
    'Donna',
    false
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
  (2, 1, false, 'verified_email_domain', true),
  (2, 2, false, 'verified_email_domain', true),
  (3, 1, false, 'verified_email_domain', true),
  (3, 2, false, 'verified_email_domain', true),
  (4, 1, false, 'verified_email_domain', true);
